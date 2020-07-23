import { Module } from '@nestjs/common';

import { NEST_CONVOY_MESSAGE_INTERCEPTORS } from './tokens';
import { ChannelMapping } from './channel-mapping';

@Module({
  providers: [ChannelMapping],
  exports: [ChannelMapping],
})
export class MessagingCommonModule {}
