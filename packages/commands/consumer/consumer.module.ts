import { Module } from '@nestjs/common';
import { MessagingProducerModule } from '@nest-convoy/messaging/producer';
import { MessagingConsumerModule } from '@nest-convoy/messaging/consumer';

import { CommandDispatcherFactory } from './command-dispatcher-factory';

@Module({
  imports: [MessagingProducerModule, MessagingConsumerModule],
  providers: [CommandDispatcherFactory],
  exports: [CommandDispatcherFactory],
})
export class CommandsConsumerModule {}
