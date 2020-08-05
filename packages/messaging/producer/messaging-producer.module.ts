import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { MessagingCommonModule } from '@nest-convoy/messaging/common';

import { NestConvoyMessageProducer, MessageProducer } from './message-producer';

@Global()
@Module({})
export class NestConvoyMessagingProducerModule {
  static register(
    provider: Omit<Provider<MessageProducer>, 'provide'>,
  ): DynamicModule {
    return {
      module: NestConvoyMessagingProducerModule,
      imports: [MessagingCommonModule],
      providers: [
        {
          provide: MessageProducer,
          ...provider,
        } as Provider<MessageProducer>,
      ],
      exports: [NestConvoyMessageProducer],
    };
  }
}
