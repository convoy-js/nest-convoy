import { Test } from '@nestjs/testing';

import { mockProvider } from '@nest-convoy/testing';
import {
  OnSagaCompletedSuccessfully,
  OnSagaRolledBack,
  OnStarting,
  SagaActions,
  SagaActionsBuilder,
  SagaCommandProducer,
  SagaInstance,
  SagaInstanceRepository,
  SagaManagerFactory,
  SagaDefinition,
  SagaManager,
} from '@nest-convoy/sagas/orchestration';
import {
  ConvoyMessageConsumer,
  MessageBuilder,
  MessageHandler,
} from '@nest-convoy/messaging';
import { SagaLockManager, SagaReplyHeaders } from '@nest-convoy/sagas/common';
import {
  CommandReplyOutcome,
  CommandWithDestination,
  ConvoyCommandProducer,
  ReplyMessageHeaders,
} from '@nest-convoy/commands';
import {
  NestSagaDefinition,
  NestSaga,
  Saga,
} from '@nest-convoy/sagas/orchestration/dsl';
import { SagaStep } from '@nest-convoy/sagas/orchestration/dsl/saga-step';

class TestCommand {}

class TestSagaData {
  constructor(readonly label: string) {}
}

@Saga(TestSagaData)
class TestSaga
  extends NestSaga<TestSagaData>
  implements
    OnStarting<TestSagaData>,
    OnSagaCompletedSuccessfully<TestSagaData>,
    OnSagaRolledBack<TestSagaData> {
  readonly sagaDefinition: SagaDefinition<TestSagaData>;

  onSagaCompletedSuccessfully(sagaId: string, data: TestSagaData): void {}

  onSagaRolledBack(sagaId: string, data: TestSagaData): void {}

  onStarting(sagaId: string, data: TestSagaData): void {}
}

describe('SagaManager', () => {
  const testResource = 'SomeResource';
  const sagaType = 'MySagaType';
  const sagaId = 'MySagaId';
  const sagaReplyChannel = `${sagaType}-reply`;

  const participantChannel1 = 'myChannel';
  const participantChannel2 = 'myChannel2';

  const requestId1 = '1';
  const requestId2 = '2';

  const command1 = new TestCommand();
  const command2 = new TestCommand();

  const commandForParticipant1 = new CommandWithDestination(
    participantChannel1,
    command1,
    testResource,
  );

  const commandForParticipant2 = new CommandWithDestination(
    participantChannel2,
    command2,
    testResource,
  );

  const replyFromParticipant1 = MessageBuilder.withPayload('{}')
    .withHeader(SagaReplyHeaders.REPLY_SAGA_TYPE, sagaType)
    .withHeader(SagaReplyHeaders.REPLY_SAGA_ID, sagaId)
    .withHeader(ReplyMessageHeaders.REPLY_OUTCOME, CommandReplyOutcome.SUCCESS)
    .build();

  let sagaInstance: SagaInstance<TestSagaData>;
  let sagaManager: SagaManager<TestSagaData>;
  let sagaMessageHandler: MessageHandler;
  let initialSagaData: TestSagaData;
  let sagaDataUpdatedByStartingHandler: TestSagaData;
  let sagaDataUpdatedByReplyHandler: TestSagaData;
  let testSaga: jest.Mocked<TestSaga>;
  let sagaDefinition: NestSagaDefinition<TestSagaData>;
  let sagaSteps: SagaStep<TestSagaData>[];
  let sagaCommandProducer: jest.Mocked<SagaCommandProducer>;
  let sagaInstanceRepository: SagaInstanceRepository;

  function createExpectedSagaInstanceAfterSecondStep(): SagaInstance {
    return new SagaInstance(
      sagaType,
      sagaId,
      'state-B',
      requestId2,
      TestSagaData.name,
      sagaDataUpdatedByReplyHandler,
    );
  }

  function createExpectedSagaInstanceAfterFirstStep() {
    return new SagaInstance(
      sagaType,
      sagaId,
      'state-A',
      requestId1,
      TestSagaData.name,
      sagaDataUpdatedByStartingHandler,
    );
  }

  function createFirstSagaActions(): SagaActions<TestSagaData> {
    return new SagaActionsBuilder<TestSagaData>()
      .withCommand(commandForParticipant1)
      .withUpdatedSagaData(sagaDataUpdatedByStartingHandler)
      .withUpdatedState('state-A')
      .build();
  }

  function createSecondSagaActions(
    compensating: boolean,
  ): SagaActions<TestSagaData> {
    return new SagaActionsBuilder<TestSagaData>()
      .withCommand(commandForParticipant2)
      .withUpdatedState('state-B')
      .withUpdatedSagaData(sagaDataUpdatedByReplyHandler)
      .withIsEndState(true)
      .withIsCompensating(compensating)
      .build();
  }

  function assertSagaInstanceEquals(
    expectedSagaInstance: SagaInstance,
    sagaInstance: SagaInstance,
  ): void {
    expect(expectedSagaInstance).toMatchObject(sagaInstance);
  }

  async function startSaga() {
    await sagaManager.subscribeToReplyChannel();

    const expectedSagaInstanceAfterFirstStep = createExpectedSagaInstanceAfterFirstStep();

    sagaCommandProducer.sendCommands.mockResolvedValue(requestId1);

    jest
      .spyOn(sagaInstanceRepository, 'save')
      .mockImplementation(async sagaInstance => {
        sagaInstance.sagaId = sagaId;
        return sagaInstance;
      });

    jest
      .spyOn(sagaInstanceRepository, 'update')
      .mockImplementation(async sagaInstance => {
        assertSagaInstanceEquals(
          expectedSagaInstanceAfterFirstStep,
          sagaInstance,
        );
      });

    sagaInstance = await sagaManager.create(initialSagaData);

    assertSagaInstanceEquals(expectedSagaInstanceAfterFirstStep, sagaInstance);

    expect(sagaCommandProducer.sendCommands).toHaveBeenCalledWith(
      sagaType,
      sagaId,
      [commandForParticipant1],
      sagaReplyChannel,
    );

    assertSagaInstanceEquals(expectedSagaInstanceAfterFirstStep, sagaInstance);
  }

  async function handleReply(compensating: boolean) {
    const expectedSagaInstanceAfterSecondStep = createExpectedSagaInstanceAfterSecondStep();

    const findSpy = jest
      .spyOn(sagaInstanceRepository, 'find')
      .mockResolvedValue(sagaInstance);

    jest
      .spyOn(sagaDefinition, 'handleReply')
      .mockResolvedValue(createSecondSagaActions(compensating));

    sagaCommandProducer.sendCommands.mockResolvedValue(requestId2);

    await sagaManager.handleMessage(replyFromParticipant1);

    expect(findSpy).toHaveBeenCalledWith(sagaType, sagaId);

    expect(sagaCommandProducer.sendCommands).toHaveBeenCalledWith(
      sagaType,
      sagaId,
      [commandForParticipant2],
      sagaReplyChannel,
    );

    assertSagaInstanceEquals(expectedSagaInstanceAfterSecondStep, sagaInstance);
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        mockProvider(ConvoyCommandProducer),
        mockProvider(ConvoyMessageConsumer),
        mockProvider(SagaCommandProducer),
        mockProvider(TestSaga),
        SagaInstanceRepository,
        SagaLockManager,
        SagaManagerFactory,
      ],
    }).compile();

    initialSagaData = new TestSagaData('initialSagaData');
    sagaDataUpdatedByStartingHandler = new TestSagaData(
      'sagaDataUpdatedByStartingHandler',
    );
    sagaDataUpdatedByReplyHandler = new TestSagaData(
      'sagaDataUpdatedByStartingHandlerSagaDataUpdatedByReplyHandler',
    );

    sagaSteps = [];
    testSaga = module.get(TestSaga);
    sagaDefinition = new NestSagaDefinition(sagaSteps);
    sagaManager = await module.get(SagaManagerFactory).create(testSaga);
    sagaCommandProducer = module.get(SagaCommandProducer);
    sagaInstanceRepository = module.get(SagaInstanceRepository);

    jest
      .spyOn<any, any>(sagaManager, 'sagaType', 'get')
      .mockReturnValue(sagaType);
    jest
      .spyOn<any, any>(sagaManager, 'sagaReplyChannel', 'get')
      .mockReturnValue(sagaReplyChannel);
    jest
      .spyOn<any, any>(sagaManager, 'getSagaDefinition')
      .mockReturnValue(sagaDefinition);
  });

  it('should execute saga successfully', async () => {
    await startSaga();
    await handleReply(false);

    // expect(testSaga.onSagaCompletedSuccessfully).toHaveBeenCalledWith(
    //   sagaId,
    //   expect.any(TestSagaData),
    // );
  });
});
