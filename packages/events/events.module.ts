import { Module } from '@nestjs/common';

import { ConvoyEventsPublisherModule } from './publisher';
import { ConvoyEventsSubscriberModule } from './subscriber';

@Module({
  imports: [ConvoyEventsPublisherModule, ConvoyEventsSubscriberModule],
  exports: [ConvoyEventsPublisherModule, ConvoyEventsSubscriberModule],
})
export class ConvoyEventsModule {}
