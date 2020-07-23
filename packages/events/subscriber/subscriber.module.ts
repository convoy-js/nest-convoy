import { Module } from '@nestjs/common';
import { EventsCommonModule } from '@nest-convoy/events/common';

import { DomainEventDispatcherFactory } from './domain-event-dispatcher-factory';

@Module({
  imports: [EventsCommonModule],
  providers: [DomainEventDispatcherFactory],
  exports: [DomainEventDispatcherFactory],
})
export class SubscriberModule {}
