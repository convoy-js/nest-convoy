import { Module } from '@nestjs/common';

import { MessagingCommonModule } from '../common';

import { InternalMessageProducer } from './message-producer';

@Module({
  imports: [MessagingCommonModule],
  providers: [InternalMessageProducer],
  exports: [InternalMessageProducer],
})
export class MessagingProducerModule {}
