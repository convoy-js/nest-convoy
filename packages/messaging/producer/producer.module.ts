import { Module } from '@nestjs/common';

import { MessagingCommonModule } from '@nest-convoy/messaging/common';

import { InternalMessageProducer } from './message-producer';

@Module({
  imports: [MessagingCommonModule],
  providers: [InternalMessageProducer],
  exports: [InternalMessageProducer],
})
export class MessagingProducerModule {}
