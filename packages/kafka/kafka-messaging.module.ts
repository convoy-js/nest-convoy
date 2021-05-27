import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import type { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Global, Module } from '@nestjs/common';
import type { DynamicModule, Provider } from '@nestjs/common';
import type { ConsumerConfig, KafkaConfig, ProducerConfig } from 'kafkajs';

import { ConvoyCdcModule } from '@nest-convoy/cdc';
import { ConvoyCoreModule } from '@nest-convoy/core/core.module';
import type { ConvoyMikroOrmOptions } from '@nest-convoy/database';
import {
  DatabaseMessageProducer,
  ConvoyDatabaseModule,
} from '@nest-convoy/database';
import type { MessageProducer } from '@nest-convoy/messaging';
import {
  ConvoyMessagingConsumerModule,
  ConvoyMessagingProducerModule,
  DatabaseDuplicateMessageDetector,
} from '@nest-convoy/messaging';

import { Kafka } from './kafka';
import { KafkaMessageBuilder } from './kafka-message-builder';
import { KafkaMessageConsumer } from './kafka-message-consumer';
import { KafkaMessageProducer } from './kafka-message-producer';
import { AvroSchemaRegistry } from './schema';
import { KAFKA_CONFIG, KAFKA_SCHEMA_REGISTRY } from './tokens';

export interface ConvoyKafkaMessagingBrokerModuleOptions {
  readonly consumer?: Omit<ConsumerConfig, 'groupId'>;
  readonly producer?: Omit<ProducerConfig, 'idempotent'>;
  readonly schemaRegistry?: SchemaRegistry;
  readonly messageProducerProvider?: Omit<Provider<MessageProducer>, 'provide'>;
  readonly database: ConvoyMikroOrmOptions;
}

@Global()
@Module({})
export class ConvoyKafkaCdcOutboxBrokerModule {
  static register(
    kafkaConfig: Omit<KafkaConfig, 'logCreator'>,
    options: Omit<
      ConvoyKafkaMessagingBrokerModuleOptions,
      'messageProducerProvider'
    >,
  ): DynamicModule {
    return {
      module: ConvoyKafkaCdcOutboxBrokerModule,
      imports: [
        ConvoyKafkaBrokerModule.register(kafkaConfig, {
          ...options,
          messageProducerProvider: {
            useClass: DatabaseMessageProducer,
          },
        }),
        ConvoyCdcModule,
      ],
    };
  }
}

@Global()
@Module({})
export class ConvoyKafkaBrokerModule {
  static register(
    kafkaConfig: Omit<KafkaConfig, 'logCreator'>,
    {
      database,
      schemaRegistry,
      messageProducerProvider,
    }: ConvoyKafkaMessagingBrokerModuleOptions,
  ): DynamicModule {
    return {
      module: ConvoyKafkaBrokerModule,
      imports: [
        ConvoyCoreModule,
        ConvoyDatabaseModule.forRoot(database),
        ConvoyMessagingConsumerModule.register(
          {
            useExisting: KafkaMessageConsumer,
          },
          {
            useClass: DatabaseDuplicateMessageDetector,
          },
        ),
        ConvoyMessagingProducerModule.register(
          messageProducerProvider || {
            useExisting: KafkaMessageProducer,
          },
        ),
        DiscoveryModule,
      ],
      providers: [
        {
          provide: KAFKA_CONFIG,
          useValue: kafkaConfig,
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
