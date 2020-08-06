import { DomainEvent } from '@nest-convoy/events/common';
import { Builder } from '@nest-convoy/core';
import { Type } from '@nestjs/common';

import { DomainEventHandlers } from './domain-event-handlers';
import {
  DomainEventHandler,
  DomainEventHandlerInvoke,
} from './domain-event-handler';

export class DomainEventHandlersBuilder
  implements Builder<DomainEventHandlers> {
  private readonly handlers: DomainEventHandler[] = [];

  // constructor(private aggregateType: string) {}

  static forAggregateType(aggregateType: string): DomainEventHandlersBuilder {
    return new DomainEventHandlersBuilder(/*aggregateType*/);
  }

  onEvent<E extends DomainEvent>(
    event: Type<E>,
    handler: DomainEventHandlerInvoke<E>,
  ): this {
    const eventHandler = new DomainEventHandler(
      // this.aggregateType,
      event,
      handler,
    );
    this.handlers.push(eventHandler);
    return this;
  }

  andForAggregateType(aggregateType: string): this {
    // this.aggregateType = aggregateType;
    return this;
  }

  build(): DomainEventHandlers {
    return new DomainEventHandlers(this.handlers);
  }
}
