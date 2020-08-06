import { Injectable } from '@nestjs/common';
import { ConvoyCommandProducer } from '@nest-convoy/commands';
import { ConvoyMessageConsumer } from '@nest-convoy/messaging';
import { SagaLockManager } from '@nest-convoy/saga/common';

import { SagaInstanceRepository } from './saga-instance-repository';
import { SagaCommandProducer } from './saga-command-producer';
import { SagaManger, SagaManager } from './saga-manager';
import { Saga } from './saga';

@Injectable()
export class SagaManagerFactory {
  constructor(
    private readonly sagaInstanceRepository: SagaInstanceRepository,
    private readonly commandProducer: ConvoyCommandProducer,
    private readonly messageConsumer: ConvoyMessageConsumer,
    private readonly sagaLockManager: SagaLockManager,
    private readonly sagaCommandProducer: SagaCommandProducer,
  ) {}

  create<Data>(saga: Saga<Data>): SagaManager<Data> {
    // TODO: Should be dynamic
    return new SagaManger(
      saga,
      this.sagaInstanceRepository,
      this.commandProducer,
      this.messageConsumer,
      this.sagaLockManager,
      this.sagaCommandProducer,
    );
  }
}
