import { Type } from '@nestjs/common';

import { AggregateRoot } from './aggregate-root';

export interface EventIdTypeAndData<E> extends EventTypeAndData<E> {
  readonly eventId: string;
}

export interface EventTypeAndData<E>
  extends Pick<EventWithMetadata<E>, 'metadata'> {
  readonly eventType: Type<E>;
  readonly eventData: Record<string, unknown>;
}

export interface EventWithMetadata<E> {
  readonly event: E;
  readonly eventId: string;
  readonly metadata: Record<string, string>;
}

export interface EventAndTrigger<E> {
  readonly event: EventIdTypeAndData<E>;
  readonly triggeringEvent: string;
}

export interface EntityIdVersionAndEventIds extends EntityIdAndVersion {
  readonly eventIds: readonly string[];
}

export interface PublishableEvents<AR extends AggregateRoot> {
  readonly aggregateType: Type<AR>;
  readonly entityId: string;
  readonly eventsWithIds: readonly EventIdTypeAndData<any>[];
}

export interface EntityIdAndVersion {
  readonly entityId: string;
  readonly entityVersion: string;
}

export interface EntityIdAndType<E = any> {
  readonly entityId: string;
  readonly entityType: Type<E>;
  // readonly entityType: string;
}
