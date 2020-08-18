import { Message } from '@nest-convoy/messaging/common';
import { Handler } from '@nest-convoy/common';
import {
  DomainEvent,
  DomainEventType,
  EventMessageHeaders,
} from '@nest-convoy/events/common';

import { DomainEventEnvelope } from './domain-event-envelope';

export type DomainEventHandlerInvoke<E extends DomainEvent = DomainEvent> = (
  dee: DomainEventEnvelope<E>,
) => Promise<void> | void;

export class DomainEventHandler implements Handler<DomainEventHandlerInvoke> {
  constructor(
    readonly event: DomainEventType,
    readonly invoke: DomainEventHandlerInvoke,
    readonly aggregateType?: string,
  ) {}

  handles(message: Message): boolean {
    return (
      this.aggregateType ===
        message.getHeader(EventMessageHeaders.AGGREGATE_TYPE) ||
      this.event.name ===
        message.getRequiredHeader(EventMessageHeaders.EVENT_TYPE)
    );
  }
}
