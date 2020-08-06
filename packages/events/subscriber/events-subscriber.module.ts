import { Module } from '@nestjs/common';
import { ConvoyEventsCommonModule } from '@nest-convoy/events/common';

import { DomainEventDispatcherFactory } from './domain-event-dispatcher-factory';

@Module({
  imports: [ConvoyEventsCommonModule],
  providers: [DomainEventDispatcherFactory],
  exports: [DomainEventDispatcherFactory],
})
export class ConvoyEventsSubscriberModule {}
