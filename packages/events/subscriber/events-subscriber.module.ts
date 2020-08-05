import { Module } from '@nestjs/common';
import { NestConvoyEventsCommonModule } from '@nest-convoy/events/common';

import { DomainEventDispatcherFactory } from './domain-event-dispatcher-factory';

@Module({
  imports: [NestConvoyEventsCommonModule],
  providers: [DomainEventDispatcherFactory],
  exports: [DomainEventDispatcherFactory],
})
export class NestConvoyEventsSubscriberModule {}
