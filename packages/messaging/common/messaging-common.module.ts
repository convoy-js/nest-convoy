import { Module } from '@nestjs/common';

import { ConvoyChannelMapping } from './channel-mapping';

@Module({
  providers: [ConvoyChannelMapping],
  exports: [ConvoyChannelMapping],
})
export class ConvoyMessagingCommonModule {}
