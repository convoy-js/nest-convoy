import { Message } from '@nest-convoy/messaging/common';

import { DomainEvent } from '../common';

export class DomainEventEnvelope<E extends DomainEvent = DomainEvent> {
  constructor(
    readonly message: Message,
    readonly aggregateType: string,
    readonly aggregateId: string,
    readonly eventId: string,
    readonly event: E,
  ) {}
}
