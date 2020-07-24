import { Type } from '@nestjs/common';
import { DomainEvent } from '@nest-convoy/events/common';

export class EventToPublish {
  constructor(
    readonly aggregateType: Type<any>,
    readonly aggregateId: string,
    readonly domainEvents: DomainEvent[],
  ) {}
}
