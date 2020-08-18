import { Test } from '@nestjs/testing';
import { Failure, Success } from '@nest-convoy/commands';
import {
  SagaUnitTestSupport,
  ConvoySagaTestingModule,
  mockProvider,
} from '@nest-convoy/testing';

import { ConditionalSagaData } from './conditional-saga.data';
import { Do1Command, Do2Command, Undo1Command } from './commands';
import { ConditionalSaga } from './conditional.saga';
import {
  WithReplyHandlers,
  WithReplyHandlersSaga,
} from './with-reply-handlers.saga';

describe('WithReplyHandlersSaga', () => {
  let saga: SagaUnitTestSupport<ConditionalSagaData>;
  let withReplyHandlers: jest.Mocked<WithReplyHandlers>;
  let withReplyHandlersSaga: WithReplyHandlersSaga;

  function expectSuccess1() {
    expect(withReplyHandlers.success1).toHaveBeenLastCalledWith(
      expect.any(ConditionalSagaData),
      expect.any(Success),
    );
  }

  function expectSuccess2() {
    expect(withReplyHandlers.success2).toHaveBeenLastCalledWith(
      expect.any(ConditionalSagaData),
      expect.any(Success),
    );
  }

  function expectCompensating() {
    expect(withReplyHandlers.compensating).toHaveBeenLastCalledWith(
      expect.any(ConditionalSagaData),
      expect.any(Success),
    );
  }

  function expectFailure1() {
    expect(withReplyHandlers.failure1).toHaveBeenLastCalledWith(
      expect.any(ConditionalSagaData),
      expect.any(Failure),
    );
  }

  function expectFailure2() {
    expect(withReplyHandlers.failure2).toHaveBeenLastCalledWith(
      expect.any(ConditionalSagaData),
      expect.any(Failure),
    );
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConvoySagaTestingModule],
      providers: [mockProvider(WithReplyHandlers), WithReplyHandlersSaga],
    }).compile();

    saga = module.get(SagaUnitTestSupport);
    withReplyHandlersSaga = module.get(WithReplyHandlersSaga);
    withReplyHandlers = module.get(WithReplyHandlers);
  });

  it('should execute all steps successfully', async () => {
    const conditionalSagaData = new ConditionalSagaData(true);
    await saga.create(withReplyHandlersSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do1Command())
      .to('participant1')
      .withExtraHeaders(ConditionalSaga.DO1_COMMAND_EXTRA_HEADERS)
      .successReply();

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .successReply();

    saga.expectCompletedSuccessfully();

    expectSuccess1();
    expectSuccess2();
  });

  it('should rollback', async () => {
    const conditionalSagaData = new ConditionalSagaData(true);
    await saga.create(withReplyHandlersSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do1Command())
      .to('participant1')
      .successReply();

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .failureReply();

    await saga
      .expect()
      .command(new Undo1Command())
      .to('participant1')
      .successReply();

    saga.expectRolledBack();

    expectSuccess1();
    expectFailure2();
    expectCompensating();
  });

  it('should execute all steps except first successfully', async () => {
    const conditionalSagaData = new ConditionalSagaData(false);
    await saga.create(withReplyHandlersSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .successReply();

    saga.expectCompletedSuccessfully();
    expectSuccess2();
  });

  it('should rollback except first', async () => {
    const conditionalSagaData = new ConditionalSagaData(false);
    await saga.create(withReplyHandlersSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .failureReply();

    saga.expectRolledBack();
    expectFailure2();
  });

  it('should fail on first step', async () => {
    const conditionalSagaData = new ConditionalSagaData(true);
    await saga.create(withReplyHandlersSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do1Command())
      .to('participant1')
      .failureReply();

    saga.expectRolledBack();
    expectFailure1();
  });
});
