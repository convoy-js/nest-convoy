import { DynamicModule, Global, Module } from '@nestjs/common';
import { ClientOptions, MicroserviceOptions } from '@nestjs/microservices';
import {
  ConvoyMessagingConsumerModule,
  ConvoyMessagingProducerModule,
} from '@nest-convoy/messaging';

import { MicroserviceMessageConsumer } from './microservice-message-consumer';
import { MicroserviceMessageProducer } from './microservice-message-producer';
import { MicroserviceProxy } from './microservice-proxy';
import { CLIENT_OPTIONS, SERVER_OPTIONS } from './tokens';

@Global()
@Module({})
export class ConvoyMessagingBrokerModule {
  static register(
    serverOptions: MicroserviceOptions = {},
    clientOptions: ClientOptions = {},
  ): DynamicModule {
    return {
      module: ConvoyMessagingBrokerModule,
      imports: [
        ConvoyMessagingConsumerModule.register({
          useExisting: MicroserviceMessageConsumer,
        }),
        ConvoyMessagingProducerModule.register({
          useExisting: MicroserviceMessageProducer,
        }),
      ],
      providers: [
        MicroserviceMessageConsumer,
        MicroserviceMessageProducer,
        MicroserviceProxy,
        {
          provide: SERVER_OPTIONS,
          useValue: serverOptions,
        },
        {
          provide: CLIENT_OPTIONS,
          useValue: clientOptions,
        },
      ],
      exports: [
        ConvoyMessagingConsumerModule,
        ConvoyMessagingProducerModule,
        MicroserviceMessageConsumer,
        MicroserviceMessageProducer,
      ],
    };
  }
}
