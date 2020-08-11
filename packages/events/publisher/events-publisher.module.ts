import { Module } from '@nestjs/common';
import { ConvoyEventsCommonModule } from '@nest-convoy/events/common';

import { DomainEventPublisher } from './domain-event-publisher';

@Module({
  imports: [ConvoyEventsCommonModule],
  providers: [DomainEventPublisher],
  exports: [DomainEventPublisher],
})
export class ConvoyEventsPublisherModule {}
