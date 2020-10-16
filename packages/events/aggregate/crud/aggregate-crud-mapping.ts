import { Injectable, Type } from '@nestjs/common';

import { Snapshot } from '../snapshot';
import {
  EventIdTypeAndData,
  EventTypeAndData,
  EventWithMetadata,
} from '../event-with-metadata';

import { SerializedSnapshot } from './serialized-snapshot';

@Injectable()
export class AggregateCrudMapping {
  toAggregateCrudFindOptions() {}
  toAggregateCrudSaveOptions() {}
  toAggregateCrudUpdateOptions() {}

  toSerializedEventsWithIds(
    serializedEvents: EventTypeAndData<any>[],
    eventIds: number[],
  ): EventIdTypeAndData<any>[] {
    return serializedEvents.map(
      (se, idx) => new EventIdTypeAndData(eventIds[idx], se),
    );
  }

  toSerializedSnapshot<S extends Snapshot>(snapshot: S): SerializedSnapshot<S> {
    return new SerializedSnapshot(
      snapshot.constructor as Type<S>,
      JSON.stringify(snapshot),
    );
  }

  toSnapshot<S extends Snapshot>({ type, json }: SerializedSnapshot<S>): S {
    return Object.assign(new type(), JSON.parse(json));
  }

  toEventTypeAndData<E extends object>(
    event: E,
    metadata?: string,
  ): EventTypeAndData<E> {
    return new EventTypeAndData(
      event.constructor as Type<E>,
      JSON.stringify(event),
      metadata,
    );
  }

  toEvent<E>(type: Type<E>, data: string): E {
    return Object.assign(new type(), JSON.parse(data));
  }

  toEventWithMetadata<E>({
    id,
    metadata,
    eventType,
    eventData,
  }: EventIdTypeAndData<E>): EventWithMetadata<E> {
    return new EventWithMetadata<E>(
      this.toEvent(eventType, eventData),
      id,
      metadata ? JSON.parse(metadata) : {},
    );
  }
}
