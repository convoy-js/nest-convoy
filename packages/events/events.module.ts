import { Module } from '@nestjs/common';

import { ConvoyEventsPublisherModule } from '@nest-convoy/events/publisher';
import { ConvoyEventsSubscriberModule } from '@nest-convoy/events/subscriber';

@Module({
  imports: [ConvoyEventsPublisherModule, ConvoyEventsSubscriberModule],
  exports: [ConvoyEventsPublisherModule, ConvoyEventsSubscriberModule],
})
export class ConvoyEventsModule {}
