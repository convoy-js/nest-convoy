import { EventContext } from '@nest-convoy/events/aggregate/event-context';
import { EventMetadata } from '@nest-convoy/events/aggregate/interfaces';

export class DispatchedEvent<E> {
  constructor(
    // readonly id: string,
    readonly entityId: string,
    readonly eventId: string,
    readonly event: E,
    readonly offset: BigInt,
    readonly eventContext: EventContext,
    readonly metadata?: EventMetadata,
  ) {}
}
