import { KafkaConfig } from 'kafkajs';
import { DynamicModule, forwardRef, Global, Module } from '@nestjs/common';
import {
  KAFKA_CLIENT_OPTIONS,
  KafkaClient,
  ConvoyKafkaMessagingModuleOptions,
} from '@nest-convoy/kafka/common';

import { KafkaMessagingConsumerModule } from './messaging/consumer';

@Global()
@Module({})
export class ConvoyKafkaMessagingModule {
  static register(options: ConvoyKafkaMessagingModuleOptions): DynamicModule {
    return {
      module: ConvoyKafkaMessagingModule,
      imports: [
        forwardRef(() =>
          KafkaMessagingConsumerModule.register(options.consumer),
        ),
      ],
      providers: [
        KafkaClient,
        {
          provide: KAFKA_CLIENT_OPTIONS,
          useValue: options.client,
        },
      ],
    };
  }
}
