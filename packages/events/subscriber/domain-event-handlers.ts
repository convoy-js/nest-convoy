import { Handlers } from '@nest-convoy/common';

import { DomainEventHandler } from './domain-event-handler';

export class DomainEventHandlers extends Handlers<DomainEventHandler> {
  getAggregateTypesAndEvents(): readonly string[] {
    return this.handlers.map(handler => handler.aggregateType);
  }
}
