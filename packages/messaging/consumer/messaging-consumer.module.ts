import { DynamicModule, Global, Module, Provider, Type } from '@nestjs/common';
import { MessagingCommonModule } from '@nest-convoy/messaging/common';

import { NestConvoyMessageConsumer, MessageConsumer } from './message-consumer';

@Global()
@Module({})
export class NestConvoyMessagingConsumerModule {
  static register(
    provider: Omit<Provider<MessageConsumer>, 'provide'>,
  ): DynamicModule {
    return {
      module: NestConvoyMessagingConsumerModule,
      imports: [MessagingCommonModule],
      providers: [
        NestConvoyMessageConsumer,
        {
          provide: MessageConsumer,
          ...provider,
        } as Provider<MessageConsumer>,
      ],
      exports: [NestConvoyMessageConsumer],
    };
  }
}
