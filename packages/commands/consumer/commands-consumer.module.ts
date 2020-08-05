import { Global, Module } from '@nestjs/common';
import { NestConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';
import { NestConvoyMessagingConsumerModule } from '@nest-convoy/messaging/consumer';

import { CommandDispatcherFactory } from './command-dispatcher-factory';

@Module({
  // imports: [
  //   NestConvoyMessagingProducerModule,
  //   NestConvoyMessagingConsumerModule,
  // ],
  providers: [CommandDispatcherFactory],
  exports: [CommandDispatcherFactory],
})
export class NestConvoyCommandsConsumerModule {}
