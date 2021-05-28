import type { DynamicModule } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';

import { ConvoyCoreModule } from '@nest-convoy/core/core.module';
import { ConvoyMessagingConsumerModule } from '@nest-convoy/messaging/consumer';
import { ConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';

import { InMemoryMessageConsumer } from './in-memory-message-consumer';
import { InMemoryMessageProducer } from './in-memory-message-producer';

@Global()
@Module({})
export class ConvoyInMemoryMessagingModule {
  static forRoot(): DynamicModule {
    return {
      module: ConvoyInMemoryMessagingModule,
      imports: [
        ConvoyCoreModule,
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
