import { Injectable } from '@nestjs/common';

import { ConvoyCommandProducer } from '@nest-convoy/commands';
import { ConvoyMessageConsumer } from '@nest-convoy/messaging';
import { SagaLockManager } from '@nest-convoy/sagas/common';

import { DefaultSagaInstanceRepository } from './saga-instance-repository';
import { SagaCommandProducer } from './saga-command-producer';
import { SagaManager } from './saga-manager';
import { Saga } from './saga';

@Injectable()
export class SagaManagerFactory {
  constructor(
    private readonly sagaInstanceRepository: DefaultSagaInstanceRepository,
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly messageConsumer: ConvoyMessageConsumer,
    private readonly sagaLockManager: SagaLockManager,
    private readonly sagaCommandProducer: SagaCommandProducer,
  ) {}

  create<Data>(saga: Saga<Data>): SagaManager<Data> {
    return new SagaManager(
      saga,
      this.sagaInstanceRepository,
      this.commandProducer,
      this.messageConsumer,
      this.sagaLockManager,
      this.sagaCommandProducer,
    );
  }
}
