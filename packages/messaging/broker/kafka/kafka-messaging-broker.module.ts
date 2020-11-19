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
  consumer?: Omit<ConsumerConfig, 'groupId'>;
  producer?: Omit<ProducerConfig, 'idempotent'>;
  database?: ConvoyTypeOrmOptions;
}

@Global()
@Module({})
export class ConvoyKafkaMessagingBrokerModule {
  static register(
    config: KafkaConfig,
    _: ConvoyKafkaMessagingBrokerModuleOptions = {},
  ): DynamicModule {
    return {
      module: ConvoyKafkaMessagingBrokerModule,
      imports: [
        ConvoyCoreModule.forRoot(_.database),
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
