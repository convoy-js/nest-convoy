import { DynamicModule, Global, Module } from '@nestjs/common';
import type { ConsumerConfig, KafkaConfig, ProducerConfig } from 'kafkajs';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

import {
  ConvoyCoreModule,
  ConvoyTypeOrmOptions,
} from '@nest-convoy/core/core.module';
import {
  ConvoyMessagingConsumerModule,
  ConvoyMessagingProducerModule,
  DatabaseDuplicateMessageDetector,
} from '@nest-convoy/messaging';

import { KafkaMessageBuilder } from './kafka-message-builder';
import { KafkaMessageProducer } from './kafka-message-producer';
import { KafkaMessageConsumer } from './kafka-message-consumer';
import { Kafka } from './kafka';
import { KAFKA_CONFIG, KAFKA_SCHEMA_REGISTRY } from './tokens';
import { AvroSchemaRegistry } from './avro-schema-registry';

export interface ConvoyKafkaMessagingBrokerModuleOptions {
  readonly consumer?: Omit<ConsumerConfig, 'groupId'>;
  readonly producer?: Omit<ProducerConfig, 'idempotent'>;
  readonly schemaRegistry?: SchemaRegistry;
  readonly database: ConvoyTypeOrmOptions;
}

@Global()
@Module({})
export class ConvoyKafkaBrokerModule {
  static register(
    config: Omit<KafkaConfig, 'logCreator'>,
    { database, schemaRegistry }: ConvoyKafkaMessagingBrokerModuleOptions,
  ): DynamicModule {
    return {
      module: ConvoyKafkaBrokerModule,
      imports: [
        ConvoyCoreModule.forRoot(database),
        ConvoyMessagingConsumerModule.register(
          {
            useExisting: KafkaMessageConsumer,
          },
          {
            useClass: DatabaseDuplicateMessageDetector,
          },
        ),
        ConvoyMessagingProducerModule.register({
          useExisting: KafkaMessageProducer,
        }),
        DiscoveryModule,
      ],
      providers: [
        {
          provide: KAFKA_CONFIG,
          useValue: config,
        },
        {
          provide: KAFKA_SCHEMA_REGISTRY,
          useValue: schemaRegistry,
        },
        Kafka,
        KafkaMessageBuilder,
        KafkaMessageProducer,
        AvroSchemaRegistry,
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
