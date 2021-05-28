import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { ConvoyChannelMapping } from './channel-mapping';
import { MessageEntity, ConsumedMessage } from './entities';

@Module({
  imports: [
    MikroOrmModule.forFeature({
      entities: [MessageEntity, ConsumedMessage],
    }),
  ],
  providers: [ConvoyChannelMapping],
  exports: [ConvoyChannelMapping, MikroOrmModule],
})
export class ConvoyMessagingCommonModule {}
