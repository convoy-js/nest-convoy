import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConsumerConfig, KafkaConfig, ProducerConfig } from 'kafkajs';

import {
  ConvoyCoreModule,
  ConvoyTypeOrmOptions,
} from '@nest-convoy/core/core.module';
import {
  ConvoyMessagingConsumerModule,
  ConvoyMessagingProducerModule,
} from '@nest-convoy/messaging';

import { KafkaMessageBuilder } from './kafka-message-builder';
import { KafkaMessageProducer } from './kafka-message-producer';
import { KafkaMessageConsumer } from './kafka-message-consumer';
import { KafkaProxy } from './kafka-proxy';
import { KAFKA_CONFIG } from './tokens';

export interface ConvoyKafkaMessagingBrokerModuleOptions {
  readonly consumer?: Omit<ConsumerConfig, 'groupId'>;
  readonly producer?: Omit<ProducerConfig, 'idempotent'>;
  readonly database?: ConvoyTypeOrmOptions;
}

@Global()
@Module({})
export class ConvoyKafkaMessagingBrokerModule {
  static register(
    config: KafkaConfig,
    { database }: ConvoyKafkaMessagingBrokerModuleOptions = {},
  ): DynamicModule {
    return {
      module: ConvoyKafkaMessagingBrokerModule,
      imports: [
        ConvoyCoreModule.forRoot(database),
        ConvoyMessagingConsumerModule.register({
          useExisting: KafkaMessageConsumer,
        }),
        ConvoyMessagingProducerModule.register({
          useExisting: KafkaMessageProducer,
        }),
      ],
      providers: [
        {
          provide: KAFKA_CONFIG,
          useValue: config,
        },
        KafkaProxy,
        KafkaMessageBuilder,
        KafkaMessageProducer,
        KafkaMessageConsumer,
      ],
      exports: [
        ConvoyMessagingConsumerModule,
        ConvoyMessagingProducerModule,
        KafkaMessageConsumer,
        KafkaMessageProducer,
      ],
    };
  }
}
