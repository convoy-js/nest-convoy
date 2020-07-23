import { Module } from '@nestjs/common';
import { MessagingCommonModule } from '@nest-convoy/messaging/common';

import { InternalMessageConsumer, MessageConsumer } from './message-consumer';

@Module({
  imports: [MessagingCommonModule],
  providers: [InternalMessageConsumer],
  exports: [InternalMessageConsumer],
})
export class MessagingConsumerModule {}
