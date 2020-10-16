import { Type } from '@nestjs/common';
import { RuntimeException } from '@nest-convoy/common';

import { AggregateRoot } from './aggregate-root';
import { EventIdTypeAndData, EventTypeAndData } from './event-with-metadata';
import { SerializedEvent } from './serialized-event';
import { AggregateSchema } from './aggregate-schema';

export interface EventSchemaManager {
  currentSchemaMetadata<A>(aggregateType: Type<A>): Record<string, string>;
  upcastEvents<A, E>(
    aggregateType: Type<A>,
    events: EventIdTypeAndData<E>[],
  ): EventIdTypeAndData<E>[];
  upcastEvent<E>(serializedEvent: SerializedEvent<E>): SerializedEvent<E>;
}

export class DefaultEventSchemaManager implements EventSchemaManager {
  static EVENT_SCHEMA_VERSION = 'convoy_schema_version';

  private readonly aggregateSchemaVersions = new WeakMap<
    Type<any>,
    AggregateSchema<any>
  >();

  add<A extends AggregateRoot>(aggregateSchema: AggregateSchema<A>): void {
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

  currentSchemaMetadata<A>(aggregateType: Type<A>): Record<string, string> {
    const version = this.currentVersion(aggregateType);
    return version
      ? { [DefaultEventSchemaManager.EVENT_SCHEMA_VERSION]: version }
      : {};
  }

  upcastEvent<E>(se: SerializedEvent<E>): SerializedEvent<E> {
    const original = new EventIdTypeAndData(
      se.id,
      new EventTypeAndData(se.eventType, se.eventData, se.metadata),
    );
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
    events: EventIdTypeAndData<E>[],
  ): EventIdTypeAndData<E>[] {
    const schema = this.aggregateSchemaVersions.get(aggregateType);
    return schema ? schema.upcastEvents(events) : events;
  }
}
