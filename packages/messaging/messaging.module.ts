import { Module } from '@nestjs/common';

import { ConvoyMessagingConsumerModule } from './consumer';
import { ConvoyMessagingProducerModule } from './producer';
import { ConvoyMessagingCommonModule } from './common';

@Module({
  imports: [
    ConvoyMessagingCommonModule,
    ConvoyMessagingConsumerModule,
    ConvoyMessagingProducerModule,
  ],
  exports: [
    ConvoyMessagingCommonModule,
    ConvoyMessagingConsumerModule,
    ConvoyMessagingProducerModule,
  ],
})
export class ConvoyMessagingModule {}
