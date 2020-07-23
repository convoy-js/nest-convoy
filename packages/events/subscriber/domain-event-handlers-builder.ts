import { DomainEvent } from '@nest-convoy/events/common';

import { DomainEventHandlers } from './domain-event-handlers';
import {
  DomainEventHandler,
  DomainEventHandlerInvoke,
} from './domain-event-handler';

export class DomainEventHandlersBuilder {
  private readonly handlers: DomainEventHandler[] = [];

  constructor(private aggregateType: string) {}

  onEvent<E extends DomainEvent>(
    event: E,
    handler: DomainEventHandlerInvoke<E>,
  ): this {
    const eventHandler = new DomainEventHandler(
      this.aggregateType,
      event,
      handler,
    );
    this.handlers.push(eventHandler);
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
