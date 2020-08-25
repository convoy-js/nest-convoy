import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';

import { ConvoyMessagingCommonModule } from '@nest-convoy/messaging/common';

import { ConvoyMessageConsumer, MessageConsumer } from './message-consumer';
import {
  DatabaseDuplicateMessageDetector,
  DuplicateMessageDetector,
} from './duplicate-message-detectors';

@Global()
@Module({})
export class ConvoyMessagingConsumerModule {
  static register(
    provider: Omit<Provider<MessageConsumer>, 'provide'>,
  ): DynamicModule {
    return {
      module: ConvoyMessagingConsumerModule,
      imports: [ConvoyMessagingCommonModule],
      providers: [
        ConvoyMessageConsumer,
        // DuplicateMessageDetector,
        {
          provide: DuplicateMessageDetector,
          useClass: DatabaseDuplicateMessageDetector,
        },
        {
          provide: MessageConsumer,
          ...provider,
        } as Provider<MessageConsumer>,
      ],
      exports: [
        DuplicateMessageDetector,
        ConvoyMessageConsumer,
        MessageConsumer,
      ],
    };
  }
}
