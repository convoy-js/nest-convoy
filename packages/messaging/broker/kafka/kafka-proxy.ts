import { Consumer, Kafka, KafkaConfig, Producer } from 'kafkajs';
import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import { KAFKA_CONFIG } from './tokens';
import { KafkaLogger } from './kafka-logger';

export const GROUP_ID = 'nest-convoy';

@Injectable()
export class KafkaProxy
  implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(this.constructor.name);
  private readonly kafka = new Kafka({
    ...this.config,
    logCreator: KafkaLogger.bind(null, this.logger),
  });
  readonly producer: Producer = this.kafka.producer({
    idempotent: true,
  });
  readonly consumer: Consumer = this.kafka.consumer({
    groupId: this.config.clientId || GROUP_ID,
  });

  constructor(
    @Inject(KAFKA_CONFIG)
    private readonly config: KafkaConfig,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await Promise.all([this.producer.connect(), this.consumer.connect()]);
  }

  async onApplicationShutdown(signal?: string): Promise<void> {
    await Promise.all([this.producer.disconnect(), this.consumer.disconnect()]);
  }
}
