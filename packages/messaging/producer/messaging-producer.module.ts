import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import type { DynamicModule, Provider } from '@nestjs/common';
import { Global, Module } from '@nestjs/common';

import { ConvoyMessagingCommonModule } from '@nest-convoy/messaging/common';

import { ConvoyMessageProducer, MessageProducer } from './message-producer';

@Global()
@Module({})
export class ConvoyMessagingProducerModule {
  static register(
    provider: Omit<Provider<MessageProducer>, 'provide'>,
  ): DynamicModule {
    return {
      module: ConvoyMessagingProducerModule,
      imports: [ConvoyMessagingCommonModule, DiscoveryModule],
      providers: [
        ConvoyMessageProducer,
        {
          provide: MessageProducer,
          ...provider,
        } as Provider<MessageProducer>,
      ],
      exports: [ConvoyMessageProducer, MessageProducer],
    };
  }
}
