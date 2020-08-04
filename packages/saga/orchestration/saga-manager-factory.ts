import { Injectable } from '@nestjs/common';
import { CommandProducer } from '@nest-convoy/commands/producer';
import { MessageConsumer } from '@nest-convoy/messaging/consumer';
import { SagaLockManager } from '@nest-convoy/saga/common';

import { SagaInstanceRepository } from './saga-instance-repository';
import { SagaCommandProducer } from './saga-command-producer';
import { InternalSagaManger, SagaManager } from './saga-manager';
import { Saga } from './saga';

@Injectable()
export class SagaManagerFactory {
  constructor(
    private readonly sagaInstanceRepository: SagaInstanceRepository,
    private readonly commandProducer: CommandProducer,
    private readonly messageConsumer: MessageConsumer,
    private readonly sagaLockManager: SagaLockManager,
    private readonly sagaCommandProducer: SagaCommandProducer,
  ) {}

  create<Data>(saga: Saga<Data>): SagaManager<Data> {
    // TODO: Should be dynamic
    return new InternalSagaManger(
      saga,
      this.sagaInstanceRepository,
      this.commandProducer,
      this.messageConsumer,
      this.sagaLockManager,
      this.sagaCommandProducer,
    );
  }
}
