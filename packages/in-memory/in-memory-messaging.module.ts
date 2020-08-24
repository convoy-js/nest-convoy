import { ConvoyMessagingConsumerModule } from '@nest-convoy/messaging/consumer';
// import { DuplicateMessageDetector } from '@nest-convoy/messaging/consumer/duplicate-message-detectors';
import { ConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConvoyCoreModule } from '@nest-convoy/core/core.module';

import { InMemoryMessageProducer } from './in-memory-message-producer';
import { InMemoryMessageConsumer } from './in-memory-message-consumer';

@Global()
@Module({})
export class ConvoyInMemoryMessagingModule {
  static forRoot(): DynamicModule {
    return {
      module: ConvoyInMemoryMessagingModule,
      imports: [
        ConvoyCoreModule.forRoot(),
        ConvoyMessagingConsumerModule.register({
          useExisting: InMemoryMessageConsumer,
        }),
        ConvoyMessagingProducerModule.register({
          useExisting: InMemoryMessageProducer,
        }),
      ],
      providers: [
        // DuplicateMessageDetector,
        InMemoryMessageConsumer,
        InMemoryMessageProducer,
      ],
      exports: [
        ConvoyMessagingConsumerModule,
        ConvoyMessagingProducerModule,
        InMemoryMessageConsumer,
        InMemoryMessageProducer,
        // DuplicateMessageDetector,
      ],
    };
  }
}
