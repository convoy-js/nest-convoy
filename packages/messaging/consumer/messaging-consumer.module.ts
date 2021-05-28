import type { DynamicModule, Provider } from '@nestjs/common';
import { Global, Module, Type } from '@nestjs/common';

import { ConvoyMessagingCommonModule } from '@nest-convoy/messaging/common';

import { DuplicateMessageDetector } from './duplicate-message-detectors';
import { ConvoyMessageConsumer, MessageConsumer } from './message-consumer';

@Global()
@Module({})
export class ConvoyMessagingConsumerModule {
  static register(
    messageConsumer: Omit<Provider<MessageConsumer>, 'provide'>,
    duplicateMessageDetector: Omit<
      Provider<DuplicateMessageDetector>,
      'provide'
    > = DuplicateMessageDetector,
  ): DynamicModule {
    return {
      module: ConvoyMessagingConsumerModule,
      imports: [ConvoyMessagingCommonModule],
      providers: [
        ConvoyMessageConsumer,
        {
          provide: DuplicateMessageDetector,
          ...duplicateMessageDetector,
        } as Provider<DuplicateMessageDetector>,
        {
          provide: MessageConsumer,
          ...messageConsumer,
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
