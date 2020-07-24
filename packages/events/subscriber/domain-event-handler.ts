import { Message } from '@nest-convoy/messaging/common';
import { Handler } from '@nest-convoy/core';

import { DomainEvent, EventMessageHeaders } from '@nest-convoy/events/common';
import { DomainEventEnvelope } from './domain-event-envelope';

export type DomainEventHandlerInvoke<E extends DomainEvent = DomainEvent> = (
  dee: DomainEventEnvelope<E>,
) => Promise<void> | void;

export class DomainEventHandler implements Handler<DomainEventHandlerInvoke> {
  constructor(
    readonly aggregateType: string,
    readonly event: DomainEvent,
    readonly invoke: DomainEventHandlerInvoke,
  ) {}

  handles(message: Message): boolean {
    return (
      this.aggregateType ===
        message.getRequiredHeader(EventMessageHeaders.AGGREGATE_TYPE) &&
      this.event.constructor.name ===
        message.getRequiredHeader(EventMessageHeaders.EVENT_TYPE)
    );
  }
}
