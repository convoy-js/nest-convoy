import { Message } from '@nest-convoy/messaging/common';
import { Handler } from '@nest-convoy/core';
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
    // readonly aggregateType: string,
    readonly event: DomainEventType,
    readonly invoke: DomainEventHandlerInvoke,
  ) {}

  handles(message: Message): boolean {
    return (
      // this.aggregateType ===
      //   message.getRequiredHeader(EventMessageHeaders.AGGREGATE_TYPE) &&
      this.event.name ===
      message.getRequiredHeader(EventMessageHeaders.EVENT_TYPE)
    );
  }
}
