import { Type } from '@nestjs/common';
import { DomainEvent } from '@nest-convoy/events';

export class EventToPublish {
  constructor(
    readonly aggregateType: Type<any>,
    readonly aggregateId: string,
    readonly domainEvents: DomainEvent[],
  ) {}
}
