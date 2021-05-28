import { Test } from '@nestjs/testing';

import {
  ConvoySagaTestSupport,
  ConvoySagaTestingModule,
} from '@nest-convoy/testing';

import { Do1Command, Do2Command, Undo1Command } from './commands';
import { ConditionalSagaData } from './conditional-saga.data';
import { ConditionalSaga } from './conditional.saga';

describe('ConditionalSaga', () => {
  let saga: ConvoySagaTestSupport<any>;
  let conditionalSaga: ConditionalSaga;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConvoySagaTestingModule],
      providers: [ConditionalSaga],
    }).compile();

    saga = module.get(ConvoySagaTestSupport);
    conditionalSaga = module.get(ConditionalSaga);
  });

  it('should execute all steps successfully', async () => {
    const conditionalSagaData = new ConditionalSagaData(true);
    await saga.create(conditionalSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do1Command())
      .to('participant1')
      // .withExtraHeaders(ConditionalSaga.DO1_COMMAND_EXTRA_HEADERS)
      .successReply();

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .successReply();

    saga.expectCompletedSuccessfully();
  });

  it('should rollback', async () => {
    const conditionalSagaData = new ConditionalSagaData(true);
    await saga.create(conditionalSaga, conditionalSagaData);

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
  });

  it('should execute all steps successfully except for first', async () => {
    const conditionalSagaData = new ConditionalSagaData(false);
    await saga.create(conditionalSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .successReply();

    saga.expectCompletedSuccessfully();
  });

  it('should rollback except for first', async () => {
    const conditionalSagaData = new ConditionalSagaData(false);
    await saga.create(conditionalSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .failureReply();

    saga.expectRolledBack();
  });

  it('should fail on first step', async () => {
    const conditionalSagaData = new ConditionalSagaData(true);
    await saga.create(conditionalSaga, conditionalSagaData);

    await saga
      .expect()
      .command(new Do1Command())
      .to('participant1')
      .failureReply();

    saga.expectRolledBack();
  });
});
