import { Module } from '@nestjs/common';

import { NEST_CONVOY_MESSAGE_INTERCEPTORS } from './tokens';
import { ConvoyChannelMapping } from './channel-mapping';

@Module({
  providers: [ConvoyChannelMapping],
  exports: [ConvoyChannelMapping],
})
export class ConvoyMessagingCommonModule {}
