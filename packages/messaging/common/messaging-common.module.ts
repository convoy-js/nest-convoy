import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ConvoyChannelMapping } from './channel-mapping';
import { MessageEntity, ReceivedMessages } from './entities';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [MessageEntity, ReceivedMessages],
    }),
  ],
  providers: [ConvoyChannelMapping],
  exports: [ConvoyChannelMapping, MikroOrmModule],
})
export class ConvoyMessagingCommonModule {}
