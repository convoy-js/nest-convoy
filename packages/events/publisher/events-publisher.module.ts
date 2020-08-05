import { Module } from '@nestjs/common';
import { NestConvoyMessagingProducerModule } from '@nest-convoy/messaging/producer';

import { NestConvoyEventsCommonModule } from '@nest-convoy/events/common';
import { DomainEventPublisher } from './domain-event-publisher';

@Module({
  imports: [NestConvoyEventsCommonModule /*NestConvoyMessagingProducerModule*/],
  providers: [DomainEventPublisher],
  exports: [DomainEventPublisher],
})
export class NestConvoyEventsPublisherModule {}
