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
