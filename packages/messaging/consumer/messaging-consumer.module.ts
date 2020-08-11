import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { ConvoyMessagingCommonModule } from '@nest-convoy/messaging/common';

import { ConvoyMessageConsumer, MessageConsumer } from './message-consumer';

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
        {
          provide: MessageConsumer,
          ...provider,
        } as Provider<MessageConsumer>,
      ],
      exports: [ConvoyMessageConsumer, MessageConsumer],
    };
  }
}
