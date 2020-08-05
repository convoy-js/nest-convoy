import { NestConvoyMessagingConsumerModule } from '@nest-convoy/messaging/consumer';
import { DynamicModule, forwardRef, Global, Module } from '@nestjs/common';
import {
  PARTIAL_KAFKA_CONSUMER_OPTIONS,
  KafkaMessagingConsumerModuleOptions,
} from '@nest-convoy/kafka/common';

import { KafkaMessageConsumer } from './kafka-message-consumer';

@Global()
@Module({})
export class KafkaMessagingConsumerModule {
  static register(
    options: KafkaMessagingConsumerModuleOptions = {},
  ): DynamicModule {
    return {
      module: KafkaMessagingConsumerModule,
      imports: [
        forwardRef(() =>
          NestConvoyMessagingConsumerModule.register({
            useExisting: KafkaMessageConsumer,
          }),
        ),
      ],
      providers: [
        KafkaMessageConsumer,
        {
          provide: PARTIAL_KAFKA_CONSUMER_OPTIONS,
          useValue: options,
        },
      ],
      exports: [NestConvoyMessagingConsumerModule, KafkaMessageConsumer],
    };
  }
}
