import { Injectable, Type } from '@nestjs/common';

import { Snapshot, SerializedSnapshot, SnapshotManager } from '../snapshot';
import {
  EventIdTypeAndData,
  EventTypeAndData,
  EventWithMetadata,
} from '../interfaces';

@Injectable()
export class AggregateCrudMapping {
  constructor(private readonly snapshotManager: SnapshotManager) {}

  toSerializedEventsWithIds(
    serializedEvents: readonly EventTypeAndData<any>[],
    eventIds: readonly string[],
  ): readonly EventIdTypeAndData<any>[] {
    return serializedEvents.map((se, idx) => ({
      eventId: eventIds[idx],
      ...se,
    }));
  }

  toSerializedSnapshot<S extends Snapshot>(snapshot: S): SerializedSnapshot<S> {
    return new SerializedSnapshot(
      snapshot.constructor.name,
      JSON.stringify(snapshot),
    );
  }

  toSnapshot<S extends Snapshot>(ss: SerializedSnapshot<S>): S {
    const type = this.snapshotManager
      .getSnapshots()
      .find(snapshot => snapshot.name === ss.type);
    if (!type) {
      throw new Error('Could not find snapshot ' + ss.type);
    }
    return Object.assign(new type(), JSON.parse(ss.json) as S);
  }

  toEventTypeAndData<E extends Record<string, unknown>>(
    event: E,
    metadata: Record<string, string> = {},
  ): EventTypeAndData<E> {
    return {
      eventType: event.constructor as Type<E>,
      eventData: event,
      metadata: metadata,
    };
  }

  toEvent<E>(type: Type<E>, data: Record<string, unknown>): E {
    return Object.assign(new type(), data);
  }

  toEventWithMetadata<E>({
    eventId,
    metadata,
    eventType,
    eventData,
  }: EventIdTypeAndData<E>): EventWithMetadata<E> {
    return {
      event: this.toEvent(eventType, eventData),
      eventId,
      metadata,
    };
  }
}
