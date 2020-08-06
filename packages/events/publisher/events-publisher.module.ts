import { Module } from '@nestjs/common';
import { ConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';

import { ConvoyEventsCommonModule } from '@nest-convoy/events/common';
import { DomainEventPublisher } from './domain-event-publisher';

@Module({
  imports: [ConvoyEventsCommonModule /*ConvoyMessagingProducerModule*/],
  providers: [DomainEventPublisher],
  exports: [DomainEventPublisher],
})
export class ConvoyEventsPublisherModule {}
