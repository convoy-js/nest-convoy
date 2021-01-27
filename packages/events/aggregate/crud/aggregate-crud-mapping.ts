import { Injectable, Type } from '@nestjs/common';
import { plainToClass, validatedPlainToClass } from '@deepkit/type';

import { ObjectLiteral } from '@nest-convoy/common';

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

  async toSnapshot<S extends Snapshot>(ss: SerializedSnapshot<S>): Promise<S> {
    const type = this.snapshotManager
      .getSnapshots()
      .find(snapshot => snapshot.name === ss.type);
    if (!type) {
      throw new Error('Could not find snapshot ' + ss.type);
    }
    return validatedPlainToClass(type as Type<S>, JSON.parse(ss.json) as S);
  }

  toEventTypeAndData<E extends ObjectLiteral>(
    event: E,
    metadata: Record<string, string> = {},
  ): EventTypeAndData<E> {
    return {
      eventType: event.constructor as Type<E>,
      eventData: event,
      metadata: metadata,
    };
  }

  async toEvent<E>(type: Type<E>, data: ObjectLiteral): Promise<E> {
    return validatedPlainToClass(type, data);
  }

  async toEventWithMetadata<E>({
    eventId,
    metadata,
    eventType,
    eventData,
  }: EventIdTypeAndData<E>): Promise<EventWithMetadata<E>> {
    const event = await this.toEvent(eventType, eventData);

    return {
      event,
      eventId,
      metadata,
    };
  }
}
