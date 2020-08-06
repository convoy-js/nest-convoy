import { Handlers } from '@nest-convoy/core';

import { DomainEventHandler } from './domain-event-handler';

export class DomainEventHandlers extends Handlers<DomainEventHandler> {
  getAggregateTypesAndEvents(): string[] {
    return this.handlers.map(handler => handler.event.name);
  }
}
