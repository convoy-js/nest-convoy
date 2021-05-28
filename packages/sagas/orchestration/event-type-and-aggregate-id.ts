import type { Type } from '@nestjs/common';

import type { DomainEvent } from '@nest-convoy/events';

export class EventTypeAndAggregateId {
  constructor(
    readonly eventType: Type<DomainEvent>,
    readonly aggregateId: string,
  ) {}

  isFor(eventType: string, aggregateId: string): boolean {
    return (
      this.eventType.name === eventType && this.aggregateId === aggregateId
    );
  }
}
