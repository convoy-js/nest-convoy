import { Test } from '@nestjs/testing';

import {
  CommandReplyOutcome,
  CommandWithDestination,
  ConvoyCommandProducer,
  ReplyMessageHeaders,
} from '@nest-convoy/commands';
import type { MessageHandler } from '@nest-convoy/messaging';
import { ConvoyMessageConsumer, MessageBuilder } from '@nest-convoy/messaging';
import { SagaLockManager, SagaReplyHeaders } from '@nest-convoy/sagas/common';
import type {
  OnSagaCompletedSuccessfully,
  OnSagaRolledBack,
  OnSagaStarting,
  SagaActions,
  SagaDefinition,
  SagaManager,
} from '@nest-convoy/sagas/orchestration';
import {
  SagaActionsBuilder,
  SagaCommandProducer,
  ConvoySagaInstance,
  DefaultSagaInstanceRepository,
  SagaManagerFactory,
} from '@nest-convoy/sagas/orchestration';
import {
  NestSagaDefinition,
  NestSaga,
  Saga,
} from '@nest-convoy/sagas/orchestration/dsl';
import type { SagaStep } from '@nest-convoy/sagas/orchestration/dsl/saga-step';
import { SagaExecutionState } from '@nest-convoy/sagas/orchestration/saga-execution-state';
import { mockProvider } from '@nest-convoy/testing';

class TestCommand {}

class TestSagaData {
  constructor(readonly label: string) {}
}

@Saga(TestSagaData)
class TestSaga
  extends NestSaga<TestSagaData>
  implements OnSagaStarting, OnSagaCompletedSuccessfully, OnSagaRolledBack
{
  readonly sagaDefinition: SagaDefinition<TestSagaData>;

  onSagaCompletedSuccessfully(sagaId: string, data: TestSagaData): void {}

  onSagaRolledBack(sagaId: string, data: TestSagaData): void {}

  onSagaStarting(sagaId: string, data: TestSagaData): void {}
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

  let sagaInstance: ConvoySagaInstance<TestSagaData>;
  let sagaManager: SagaManager<TestSagaData>;
  let sagaMessageHandler: MessageHandler;
  let initialSagaData: TestSagaData;
  let sagaDataUpdatedByStartingHandler: TestSagaData;
  let sagaDataUpdatedByReplyHandler: TestSagaData;
  let testSaga: jest.Mocked<TestSaga>;
  let sagaDefinition: NestSagaDefinition<TestSagaData>;
  let sagaSteps: SagaStep<TestSagaData>[];
  let sagaCommandProducer: jest.Mocked<SagaCommandProducer>;
  let sagaInstanceRepository: DefaultSagaInstanceRepository;

  function createExpectedSagaInstanceAfterSecondStep(): ConvoySagaInstance {
    return new ConvoySagaInstance(
      sagaType,
      sagaId,
      'state-B',
      requestId2,
      TestSagaData.name,
      sagaDataUpdatedByReplyHandler,
    );
  }

  function createExpectedSagaInstanceAfterFirstStep() {
    return new ConvoySagaInstance(
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
      .withUpdatedState(new SagaExecutionState())
      .withUpdatedSagaData(sagaDataUpdatedByStartingHandler)
      .build();
  }

  function createSecondSagaActions(
    compensating: boolean,
  ): SagaActions<TestSagaData> {
    return new SagaActionsBuilder<TestSagaData>()
      .withCommand(commandForParticipant2)
      .withUpdatedState(new SagaExecutionState())
      .withUpdatedSagaData(sagaDataUpdatedByReplyHandler)
      .withIsEndState(true)
      .withIsCompensating(compensating)
      .build();
  }

  function assertSagaInstanceEquals(
    expectedSagaInstance: ConvoySagaInstance,
    sagaInstance: ConvoySagaInstance,
  ): void {
    expect(expectedSagaInstance).toMatchObject(sagaInstance);
  }

  async function startSaga() {
    await sagaManager.subscribeToReplyChannel();

    const expectedSagaInstanceAfterFirstStep =
      createExpectedSagaInstanceAfterFirstStep();

    sagaCommandProducer.sendCommands.mockResolvedValue(requestId1);

    jest
      .spyOn(sagaInstanceRepository, 'save')
      .mockImplementation(async sagaInstance => {
        sagaInstance.id = sagaId;
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
    const expectedSagaInstanceAfterSecondStep =
      createExpectedSagaInstanceAfterSecondStep();

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
        DefaultSagaInstanceRepository,
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
    sagaInstanceRepository = module.get(DefaultSagaInstanceRepository);

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
