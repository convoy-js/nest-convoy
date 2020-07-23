import { Handle } from '@nest-convoy/core';
import { DomainEventHandler } from './domain-event-handler';

export class DomainEventHandlers extends Handle<DomainEventHandler> {
  getAggregateTypesAndEvents(): Set<string> {
    return new Set(this.handlers.map(handler => handler.aggregateType));
  }
}
