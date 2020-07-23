import { Module } from '@nestjs/common';
import { MessagingProducerModule } from '@nest-convoy/messaging/producer';

import { EventsCommonModule } from '../common';
import { DomainEventPublisher } from './domain-event-publisher';

@Module({
  imports: [MessagingProducerModule, EventsCommonModule],
  providers: [DomainEventPublisher],
  exports: [DomainEventPublisher],
})
export class EventsPublisherModule {}
