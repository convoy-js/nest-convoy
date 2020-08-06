import { Module } from '@nestjs/common';
import { ConvoyMessagingConsumerModule } from '@nest-convoy/messaging/consumer';
import { ConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';
import { ConvoyMessagingCommonModule } from '@nest-convoy/messaging/common';

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
