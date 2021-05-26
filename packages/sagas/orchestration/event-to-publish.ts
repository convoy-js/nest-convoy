import type { Type } from '@nest-convoy/common';
import type { DomainEvent } from '@nest-convoy/events';

export class EventToPublish {
  constructor(
    readonly aggregateType: Type,
    readonly aggregateId: string,
    readonly domainEvents: readonly DomainEvent[],
  ) {}
}
