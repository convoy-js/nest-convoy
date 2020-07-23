import { Handle } from '@nest-convoy/core';

import { DomainEventHandler } from './domain-event-handler';

export class DomainEventHandlers extends Handle<DomainEventHandler> {
  getAggregateTypesAndEvents(): string[] {
    return this.handlers.map(handler => handler.aggregateType);
  }
}
