import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import { ConvoyChannelMapping } from './channel-mapping';
import { MessageEntity, ReceivedMessagesEntity } from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature(
      [MessageEntity, ReceivedMessagesEntity],
      NEST_CONVOY_CONNECTION,
    ),
  ],
  providers: [ConvoyChannelMapping],
  exports: [ConvoyChannelMapping, TypeOrmModule],
})
export class ConvoyMessagingCommonModule {}
