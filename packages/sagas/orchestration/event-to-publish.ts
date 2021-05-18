import type { Type } from '@nestjs/common';
import type { DomainEvent } from '@nest-convoy/events';

export class EventToPublish {
  constructor(
    readonly aggregateType: Type<any>,
    readonly aggregateId: string,
    readonly domainEvents: readonly DomainEvent[],
  ) {}
}
