import { DomainEvent } from '../common';

import { DomainEventHandlers } from './domain-event-handlers';
import {
  DomainEventHandler,
  DomainEventHandlerInvoke,
} from './domain-event-handler';

export class DomainEventHandlersBuilder {
  private readonly handlers: DomainEventHandler[] = [];

  constructor(private aggregateType: string) {}

  onEvent<E extends DomainEvent>(
    eventClass: object,
    handler: DomainEventHandlerInvoke<E>,
  ): this {
    this.handlers.push(
      new DomainEventHandler(
        this.aggregateType,
        eventClass as DomainEvent,
        handler,
      ),
    );
    return this;
  }

  andForAggregateType(aggregateType: string): this {
    this.aggregateType = aggregateType;
    return this;
  }

  build(): DomainEventHandlers {
    return new DomainEventHandlers(this.handlers);
  }
}
