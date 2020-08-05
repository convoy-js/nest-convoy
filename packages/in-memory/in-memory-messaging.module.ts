import { NestConvoyMessagingConsumerModule } from '@nest-convoy/messaging/consumer';
import { NestConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';
import { DynamicModule, Global, Module } from '@nestjs/common';

import { InMemoryMessageProducer } from './in-memory-message-producer';
import { InMemoryMessageConsumer } from './in-memory-message-consumer';

@Global()
@Module({})
export class NestConvoyInMemoryMessagingModule {
  static register(): DynamicModule {
    return {
      module: NestConvoyInMemoryMessagingModule,
      imports: [
        NestConvoyMessagingConsumerModule.register({
          useExisting: InMemoryMessageConsumer,
        }),
        NestConvoyMessagingProducerModule.register({
          useExisting: InMemoryMessageProducer,
        }),
      ],
      providers: [InMemoryMessageConsumer, InMemoryMessageProducer],
      exports: [
        NestConvoyMessagingConsumerModule,
        NestConvoyMessagingProducerModule,
        InMemoryMessageConsumer,
        InMemoryMessageProducer,
      ],
    };
  }
}
