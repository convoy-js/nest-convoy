import { DynamicModule, Global, Module } from '@nestjs/common';
import { MessageConsumer } from '@nest-convoy/messaging/consumer';

import { KafkaMessageConsumer } from './kafka-message-consumer';

@Global()
@Module({
  providers: [
    {
      provide: MessageConsumer,
      useClass: KafkaMessageConsumer,
    },
  ],
})
export class NestConvoyKafkaMessagingModule {
  static register(): DynamicModule {
    return {
      module: NestConvoyKafkaMessagingModule,
    };
  }
}
