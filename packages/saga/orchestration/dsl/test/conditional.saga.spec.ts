import { Test } from '@nestjs/testing';
import {
  SagaUnitTestSupport,
  ConvoySagaTestingModule,
} from '@nest-convoy/testing/saga';

import { ConditionalSaga } from './conditional.saga';
import { ConditionalSagaData } from './conditional-saga.data';
import { Do1Command, Do2Command, Undo1Command } from './commands';

describe('ConditionalSaga', () => {
  let sagaTest: SagaUnitTestSupport<any>;
  let conditionalSaga: ConditionalSaga;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConvoySagaTestingModule],
      providers: [ConditionalSaga],
    }).compile();

    sagaTest = module.get(SagaUnitTestSupport);
    conditionalSaga = module.get(ConditionalSaga);
  });

  it.only('shouldExecuteAllStepsSuccessfully', async () => {
    const conditionalSagaData = new ConditionalSagaData(true);
    const saga = await sagaTest.create(conditionalSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do1Command())
      .to('participant1')
      .successReply();

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .successReply();

    saga.expectCompletedSuccessfully();
  });

  it('shouldRollback', async () => {
    const conditionalSagaData = new ConditionalSagaData(true);
    const saga = await sagaTest.create(conditionalSaga, conditionalSagaData);

    saga.expect().command(new Do1Command()).to('participant1');
    await saga.successReply();

    saga.expect().command(new Do2Command()).to('participant2');
    await saga.failureReply();

    saga.expect().command(new Undo1Command()).to('participant1');
    await saga.successReply();

    saga.expectRolledBack();
  });

  it('shouldExecuteAllStepsExcept1Successfully', async () => {
    const conditionalSagaData = new ConditionalSagaData(false);
    const saga = await sagaTest.create(conditionalSaga, conditionalSagaData);

    saga.expect().command(new Do2Command()).to('participant2');
    await saga.successReply();

    saga.expectCompletedSuccessfully();
  });

  it('shouldRollbackExcept1', async () => {
    const conditionalSagaData = new ConditionalSagaData(false);
    const saga = await sagaTest.create(conditionalSaga, conditionalSagaData);

    saga.expect().command(new Do2Command()).to('participant2');
    await saga.failureReply();

    saga.expectRolledBack();
  });

  it('shouldFailOnFirstStep', async () => {
    const conditionalSagaData = new ConditionalSagaData(true);
    const saga = await sagaTest.create(conditionalSaga, conditionalSagaData);

    saga.expect().command(new Do1Command()).to('participant1');
    await saga.failureReply();

    saga.expectRolledBack();
  });
});
