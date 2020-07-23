import { Module } from '@nestjs/common';
import { MessagingProducerModule } from '@nest-convoy/messaging/producer';

import { InternalCommandProducer } from './command-producer';

@Module({
  imports: [MessagingProducerModule],
  providers: [InternalCommandProducer],
  exports: [InternalCommandProducer],
})
export class CommandsProducerModule {}
