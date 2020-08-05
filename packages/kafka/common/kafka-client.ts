import { Inject, Injectable } from '@nestjs/common';
import { Kafka, KafkaConfig } from 'kafkajs';

import { KAFKA_CLIENT_OPTIONS } from './tokens';

@Injectable()
export class KafkaClient extends Kafka {
  constructor(@Inject(KAFKA_CLIENT_OPTIONS) options: KafkaConfig) {
    super(options);
  }
}
