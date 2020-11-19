import { Consumer, Kafka, KafkaConfig, Producer } from 'kafkajs';
import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import { KAFKA_CONFIG } from './tokens';

export const GROUP_ID = 'nest-convoy';

@Injectable()
export class KafkaProxy
  implements OnApplicationBootstrap, OnApplicationShutdown {
  // TODO: Custom logger
  private readonly kafka = new Kafka(this.config);
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
