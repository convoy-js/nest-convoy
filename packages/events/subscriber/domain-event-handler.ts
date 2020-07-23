import { Message } from '@nest-convoy/messaging/common';

import { DomainEvent, EventMessageHeaders } from '../common';
import { DomainEventEnvelope } from './domain-event-envelope';

export type DomainEventHandlerInvoke<E = DomainEvent> = (
  dee: DomainEventEnvelope<DomainEvent>,
) => void;

export class DomainEventHandler {
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
