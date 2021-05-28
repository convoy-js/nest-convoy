import { Test } from '@nestjs/testing';

import {
  ConvoySagaTestSupport,
  ConvoySagaTestingModule,
  mockProvider,
} from '@nest-convoy/testing';

import { Do2Command, Undo2Command } from './commands';
import { LocalSagaData } from './local-saga.data';
import { LocalSaga, LocalSagaSteps } from './local.saga';

describe('LocalSaga', () => {
  let saga: ConvoySagaTestSupport<LocalSagaData>;
  let localSaga: LocalSaga;
  let localSagaSteps: jest.Mocked<LocalSagaSteps>;
  let localSagaData: LocalSagaData;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConvoySagaTestingModule],
      providers: [mockProvider(LocalSagaSteps), LocalSaga],
    }).compile();

    saga = module.get(ConvoySagaTestSupport);
    localSaga = module.get(LocalSaga);
    localSagaSteps = module.get(LocalSagaSteps);
    localSagaData = new LocalSagaData();
  });

  it('should execute all steps successfully', async () => {
    await saga.create(localSaga, localSagaData);

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .successReply();

    saga.expectCompletedSuccessfully();
  });

  it('should rollback from second step', async () => {
    await saga.create(localSaga, localSagaData);

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .failureReply();

    saga.expectRolledBack();
  });

  it('should handle failure of first local step', async () => {
    const exception = new Error('Failed local step');
    const localStep1Spy = localSagaSteps.localStep1.mockImplementation(() => {
      throw exception;
    });

    await saga.create(localSaga, localSagaData);

    expect(localStep1Spy).toHaveBeenCalledWith(localSagaData);

    saga.expectException(exception);
  });

  it('should handle failure of last local step', async () => {
    const localStep3Spy = localSagaSteps.localStep3.mockImplementation(() => {
      throw new Error();
    });

    await saga.create(localSaga, localSagaData);

    await saga
      .expect()
      .command(new Do2Command())
      .to('participant2')
      .successReply();

    await saga
      .expect()
      .command(new Undo2Command())
      .to('participant2')
      .successReply();

    expect(localStep3Spy).toHaveBeenCalledWith(localSagaData);

    saga.expectRolledBack();
  });
});
