import { Injectable, Type } from '@nestjs/common';

import { RuntimeException } from '@nest-convoy/common';

import { AggregateRoot } from '../aggregate-root';
import { EventIdTypeAndData } from '../interfaces';
import { SerializedEvent } from '../serialized-event';
import { AggregateSchema } from '../aggregate-schema';

export const EVENT_SCHEMA_MANAGER = Symbol('EVENT_SCHEMA_MANAGER');

export interface EventSchemaManager {
  currentSchemaMetadata<A>(
    aggregateType: Type<A>,
  ): Record<string, string> | undefined;
  upcastEvents<A, E>(
    aggregateType: Type<A>,
    events: readonly EventIdTypeAndData<E>[],
  ): readonly EventIdTypeAndData<E>[];
  upcastEvent<E>(serializedEvent: SerializedEvent<E>): SerializedEvent<E>;
}

@Injectable()
export class DefaultEventSchemaManager implements EventSchemaManager {
  static EVENT_SCHEMA_VERSION = 'convoy_schema_version';

  private readonly aggregateSchemaVersions = new WeakMap<
    Type,
    AggregateSchema<any>
  >();

  add<AR extends AggregateRoot>(aggregateSchema: AggregateSchema<AR>): void {
    if (this.aggregateSchemaVersions.has(aggregateSchema.aggregateType)) {
      throw new RuntimeException(
        'Already defined: ' + aggregateSchema.aggregateType.name,
      );
    }

    this.aggregateSchemaVersions.set(
      aggregateSchema.aggregateType,
      aggregateSchema,
    );
  }

  currentVersion<A>(aggregateType: Type<A>): string | undefined {
    const schema = this.aggregateSchemaVersions.get(aggregateType);
    return schema?.currentVersion;
  }

  currentSchemaMetadata<A>(
    aggregateType: Type<A>,
  ): Record<string, string> | undefined {
    const version = this.currentVersion(aggregateType);
    return version
      ? { [DefaultEventSchemaManager.EVENT_SCHEMA_VERSION]: version }
      : undefined;
  }

  upcastEvent<E>(se: SerializedEvent<E>): SerializedEvent<E> {
    const original: EventIdTypeAndData<E> = {
      eventId: se.id,
      eventType: se.eventType,
      eventData: se.eventData,
      metadata: se.metadata,
    };
    const upcasted = this.upcastEvents(se.entityType, [original])[0];

    return new SerializedEvent(
      se.id,
      se.entityId,
      se.entityType,
      upcasted.eventData,
      upcasted.eventType,
      se.swimLane,
      se.offset,
      se.eventContext,
      upcasted.metadata,
    );
  }

  upcastEvents<A, E>(
    aggregateType: Type<A>,
    events: readonly EventIdTypeAndData<E>[],
  ): readonly EventIdTypeAndData<E>[] {
    const schema = this.aggregateSchemaVersions.get(aggregateType);
    return schema ? schema.upcastEvents(events) : events;
  }
}
