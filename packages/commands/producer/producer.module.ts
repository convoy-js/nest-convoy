import { Module } from '@nestjs/common';
import { MessagingProducerModule } from '@nest-convoy/messaging/producer';

import { CommandProducer } from './command-producer';

@Module({
  imports: [MessagingProducerModule],
  providers: [CommandProducer],
  exports: [CommandProducer],
})
export class CommandsProducerModule {}
