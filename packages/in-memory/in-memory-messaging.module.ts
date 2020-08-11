import { ConvoyMessagingConsumerModule } from '@nest-convoy/messaging/consumer';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';

import { InMemoryMessageProducer } from './in-memory-message-producer';
import { InMemoryMessageConsumer } from './in-memory-message-consumer';

@Global()
@Module({})
export class ConvoyInMemoryMessagingModule {
  static forRoot(): DynamicModule {
    return {
      module: ConvoyInMemoryMessagingModule,
      imports: [
        ConvoyMessagingConsumerModule.register({
          useExisting: InMemoryMessageConsumer,
        }),
        ConvoyMessagingProducerModule.register({
          useExisting: InMemoryMessageProducer,
        }),
      ],
      providers: [InMemoryMessageConsumer, InMemoryMessageProducer],
      exports: [
        ConvoyMessagingConsumerModule,
        ConvoyMessagingProducerModule,
        InMemoryMessageConsumer,
        InMemoryMessageProducer,
      ],
    };
  }
}
