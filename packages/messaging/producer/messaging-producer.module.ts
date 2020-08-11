import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import {
  MessageInterceptor,
  ConvoyMessagingCommonModule,
  NEST_CONVOY_MESSAGE_INTERCEPTORS,
} from '@nest-convoy/messaging/common';

import { ConvoyMessageProducer, MessageProducer } from './message-producer';

@Global()
@Module({})
export class ConvoyMessagingProducerModule {
  static register(
    provider: Omit<Provider<MessageProducer>, 'provide'>,
    interceptors: MessageInterceptor[] = [],
  ): DynamicModule {
    return {
      module: ConvoyMessagingProducerModule,
      imports: [ConvoyMessagingCommonModule],
      providers: [
        ConvoyMessageProducer,
        {
          provide: NEST_CONVOY_MESSAGE_INTERCEPTORS,
          useValue: interceptors,
        },
        {
          provide: MessageProducer,
          ...provider,
        } as Provider<MessageProducer>,
      ],
      exports: [ConvoyMessageProducer, MessageProducer],
    };
  }
}
