import { Module } from '@nestjs/common';
import { MessagingProducerModule } from '@nest-convoy/messaging/producer';

@Module({
  imports: [MessagingProducerModule],
})
export class CommandsConsumerModule {}
