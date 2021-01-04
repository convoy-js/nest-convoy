import { Inject, Injectable, Type } from '@nestjs/common';

import { Snapshot, SnapshotManager } from '../snapshot';
import { AggregateRoot } from '../aggregate-root';
import { EntityIdAndVersion } from '../interfaces';
import { Aggregates } from '../aggregates';
import {
  MISSING_APPLY_EVENT_METHOD_STRATEGY,
  MissingApplyEventMethodStrategy,
} from '../missing-apply-event-method-strategy';
import {
  EVENT_SCHEMA_MANAGER,
  EventSchemaManager,
} from './event-schema-manager';
import { AGGREGATE_CRUD, AggregateCrud } from './aggregate-crud';
import { AggregateCrudMapping } from './aggregate-crud-mapping';
import {
  AggregateCrudFindOptions,
  AggregateCrudSaveOptions,
  AggregateCrudUpdateOptions,
  EntityWithMetadata,
} from './interfaces';

@Injectable()
export class AggregateStoreCrud {
  possibleSnapshot = this.snapshotManager.possiblySnapshot.bind(
    this.snapshotManager,
  );
  recreateFromSnapshot = this.snapshotManager.recreateFromSnapshot.bind(
    this.snapshotManager,
  );

  constructor(
    private readonly aggregates: Aggregates,
    private readonly aggregateCrudMapping: AggregateCrudMapping,
    private readonly snapshotManager: SnapshotManager,
    @Inject(AGGREGATE_CRUD)
    private readonly aggregateCrud: AggregateCrud,
    @Inject(MISSING_APPLY_EVENT_METHOD_STRATEGY)
    private readonly missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<any>,
    @Inject(EVENT_SCHEMA_MANAGER)
    private readonly eventSchemaManager: EventSchemaManager,
  ) {}

  private withSchemaMetadata<AR extends AggregateRoot>(
    aggregateType: Type<AR>,
    eventMetadata: Record<string, string> = {},
  ): Record<string, string> {
    const schemaMetadata = this.eventSchemaManager.currentSchemaMetadata(
      aggregateType,
    );

    return schemaMetadata
      ? { ...schemaMetadata, ...eventMetadata }
      : eventMetadata;
  }

  async save<AR extends AggregateRoot, E extends readonly any[]>(
    aggregate: AR,
    events: E,
    options?: AggregateCrudSaveOptions,
  ): Promise<EntityIdAndVersion> {
    const serializedMetadata =
      options &&
      this.withSchemaMetadata(
        aggregate.constructor as Type<AR>,
        options.eventMetadata,
      );

    const serializedEvents = events.map(event =>
      this.aggregateCrudMapping.toEventTypeAndData(event, serializedMetadata),
    );

    return this.aggregateCrud.save(aggregate, serializedEvents, options);
  }

  async find<AR extends AggregateRoot>(
    aggregateType: Type<AR>,
    entityId: string,
    options?: AggregateCrudFindOptions,
  ): Promise<EntityWithMetadata<AR>> {
    const outcome = await this.aggregateCrud.find(
      aggregateType,
      entityId,
      options,
    );

    const eventsWithIds = this.eventSchemaManager
      .upcastEvents(aggregateType, outcome.events)
      .map(event => this.aggregateCrudMapping.toEventWithMetadata(event));
    const events = eventsWithIds.map(e => e.event);

    let entity: AR;
    if (outcome.snapshot) {
      const snapshot = await this.recreateFromSnapshot(
        aggregateType,
        this.aggregateCrudMapping.toSnapshot(
          outcome.snapshot.serializedSnapshot,
        ),
      );
      entity = await this.aggregates.applyEvents(snapshot!, events);
    } else {
      entity = await this.aggregates.recreateAggregate(aggregateType, events);
    }

    return {
      snapshotVersion: outcome.snapshot?.entityVersion,
      events: eventsWithIds,
      entityVersion: events.length
        ? events[events.length - 1]
        : outcome.snapshot?.entityVersion,
      entityId,
      entity,
    };
  }

  async update<
    AR extends AggregateRoot,
    E extends readonly any[],
    S extends Snapshot
  >(
    aggregate: AR,
    { entityVersion, entityId }: EntityIdAndVersion,
    events: E,
    options?: AggregateCrudUpdateOptions<AR, S>,
  ): Promise<EntityIdAndVersion> {
    const entityType = aggregate.constructor.name;
    const serializedMetadata =
      options &&
      this.withSchemaMetadata(
        aggregate.constructor as Type<AR>,
        options.eventMetadata,
      );

    const serializedEvents = events.map(event =>
      this.aggregateCrudMapping.toEventTypeAndData(event, serializedMetadata),
    );

    return this.aggregateCrud.update(
      {
        entityType,
        entityId,
      },
      entityVersion,
      serializedEvents,
      options,
    );
  }
}
