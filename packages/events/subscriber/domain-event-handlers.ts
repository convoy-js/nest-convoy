import { Handlers } from '@nest-convoy/common';

import { DomainEventHandler } from './domain-event-handler';

export class DomainEventHandlers extends Handlers<DomainEventHandler> {
  getAggregateTypesAndEvents(): string[] {
    return this.handlers.map(handler => handler.aggregateType);
    // return this.handlers
    //   .flatMap(handler => [handler.aggregateType, handler.event.name])
    //   .filter(v => !!v);
  }
}
