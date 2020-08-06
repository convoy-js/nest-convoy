import { Global, Module } from '@nestjs/common';
import { ConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';
import { ConvoyMessagingConsumerModule } from '@nest-convoy/messaging/consumer';

import { CommandDispatcherFactory } from './command-dispatcher-factory';

@Module({
  // imports: [
  //   ConvoyMessagingProducerModule,
  //   ConvoyMessagingConsumerModule,
  // ],
  providers: [CommandDispatcherFactory],
  exports: [CommandDispatcherFactory],
})
export class ConvoyCommandsConsumerModule {}
