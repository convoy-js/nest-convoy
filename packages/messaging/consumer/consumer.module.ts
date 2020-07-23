import { Module } from '@nestjs/common';

import { MessagingCommonModule } from '../common';
import { InternalMessageConsumer } from './message-consumer';

@Module({
  imports: [MessagingCommonModule],
  providers: [InternalMessageConsumer],
  exports: [InternalMessageConsumer],
})
export class MessagingConsumerModule {}
