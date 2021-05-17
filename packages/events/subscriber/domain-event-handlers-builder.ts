import { Type } from '@nestjs/common';

import { DomainEvent } from '@nest-convoy/events/common';
import { Builder } from '@nest-convoy/common';

import { DomainEventHandlers } from './domain-event-handlers';
import {
  DomainEventHandler,
  DomainEventMessageHandler,
} from './domain-event-handler';

export class DomainEventHandlersBuilder
  implements Builder<DomainEventHandlers> {
  static forAggregateType(aggregateType: string): DomainEventHandlersBuilder {
    return new DomainEventHandlersBuilder(aggregateType);
  }

  private handlers: readonly DomainEventHandler[] = [];

  constructor(private aggregateType: string) {}

  onEvent<E extends DomainEvent>(
    event: Type<E>,
    handler: DomainEventMessageHandler<E>,
  ): this {
    const eventHandler = new DomainEventHandler<E>(
      event,
      handler,
      this.aggregateType,
    );
    this.handlers = [...this.handlers, eventHandler];

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
