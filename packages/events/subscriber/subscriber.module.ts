import { Module } from '@nestjs/common';

import { EventsCommonModule } from '../common';
import { DomainEventDispatcherFactory } from './domain-event-dispatcher-factory';

@Module({
  imports: [EventsCommonModule],
  providers: [DomainEventDispatcherFactory],
  exports: [DomainEventDispatcherFactory],
})
export class SubscriberModule {}
