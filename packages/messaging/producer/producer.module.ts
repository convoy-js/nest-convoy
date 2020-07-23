import { Module } from '@nestjs/common';

import { MessagingCommonModule } from '../common';

import { MessageProducer } from './message-producer';

@Module({
  imports: [MessagingCommonModule],
  providers: [MessageProducer],
  exports: [MessageProducer],
})
export class MessagingProducerModule {}
