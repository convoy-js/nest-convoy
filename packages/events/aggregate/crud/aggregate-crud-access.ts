import { Type } from '@nestjs/common';
import { InjectConnection, InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import { EntitiesEntity, EventsEntity, SnapshotsEntity } from '../entities';
import { AggregateRoot } from '../aggregate-root';
import { SaveUpdateResult } from '../save-update-result';
import { LoadedEvents } from '../loaded-events';
import {
  SerializedSnapshot,
  SnapshotTriggeringEvents,
  SerializedSnapshotWithVersion,
  Snapshot,
} from '../snapshot';
import {
  DuplicateTriggeringEventException,
  EntityNotFoundException,
  OptimisticLockingException,
} from '../exceptions';
import {
  EventIdTypeAndData,
  EntityIdAndType,
  EventTypeAndData,
  EventAndTrigger,
} from '../interfaces';
import {
  AggregateCrudFindOptions,
  AggregateCrudSaveOptions,
  AggregateCrudUpdateOptions,
} from './interfaces';

export class AggregateCrudAccess {
  constructor(
    @InjectRepository(EntitiesEntity)
    private readonly entities: Repository<EntitiesEntity>,
    @InjectRepository(EventsEntity)
    private readonly events: Repository<EventsEntity>,
    @InjectRepository(EventsEntity)
    private readonly snapshots: Repository<SnapshotsEntity>,
    @InjectConnection(NEST_CONVOY_CONNECTION)
    private readonly connection: Connection,
  ) {}

  private toEventId(
    eventTypeAndData: EventTypeAndData<any>,
  ): EventIdTypeAndData<any> {
    return {
      eventId: uuidv4(),
      ...eventTypeAndData,
    };
  }

  async save<AR extends AggregateRoot>(
    aggregate: AR,
    events: readonly EventTypeAndData<any>[],
    options?: AggregateCrudSaveOptions,
  ): Promise<SaveUpdateResult<AR>> {
    const eventsWithIds = events.map(e => this.toEventId(e));
    const entityId = options?.entityId || uuidv4();
    const entityVersion = eventsWithIds[eventsWithIds.length - 1].eventId;
    const entityType = aggregate.constructor.name;

    const entity = await this.entities.save({
      type: entityType,
      id: entityId,
      version: entityVersion,
    });

    await this.connection.transaction(manager =>
      Promise.all(
        eventsWithIds.map(event =>
          manager.create(EventsEntity, {
            eventId: event.eventId,
            eventData: event.eventData,
            eventType: event.eventType.name,
            triggeringEvent: options?.triggeringEvent?.eventToken,
            metadata: event.metadata,
            entityType,
            entityId,
          }),
        ),
      ),
    );

    return new SaveUpdateResult(
      {
        entityId: entity.id,
        entityVersion: entity.version,
        eventIds: eventsWithIds.map(e => e.eventId),
      },
      {
        aggregateType: aggregate.constructor as Type<AR>,
        entityId: entity.id,
        eventsWithIds,
      },
    );
  }

  async find<AR extends AggregateRoot>(
    aggregateType: Type<AR>,
    entityId: string,
    options?: AggregateCrudFindOptions,
  ): Promise<LoadedEvents> {
    const entityType = aggregateType.name;
    const snapshot = await this.snapshots.findOne({
      where: {
        entityType,
        entityId,
      },
    });

    let events: readonly EventsEntity<any, any>[];
    let serializedSnapshot: SerializedSnapshotWithVersion<any> | undefined;

    if (snapshot) {
      serializedSnapshot = new SerializedSnapshotWithVersion(
        new SerializedSnapshot(
          snapshot.snapshotType,
          JSON.stringify(snapshot.snapshotJson),
        ),
        snapshot.entityVersion,
      );
      events = await this.events
        .createQueryBuilder()
        .where(
          'entityType = :entityType and entityId = :entityId and eventId > :eventId',
        )
        .orderBy('eventId', 'ASC')
        .setParameters({
          eventId: snapshot.entityVersion,
          entityType,
          entityId,
        })
        .getMany();
    } else {
      events = await this.events
        .createQueryBuilder()
        .where('entityType = :entityType and entityId = :entityId')
        .setParameters({
          entityType,
          entityId,
        })
        .getMany();
    }

    const eventsAndTriggers: readonly EventAndTrigger<any>[] = events.map(
      e => ({
        event: {
          ...e,
          // TODO
          eventType: class {},
        },
        triggeringEvent: e.triggeringEvent!,
      }),
    );

    const matching = eventsAndTriggers.find(
      et => options?.triggeringEvent?.eventToken === et.triggeringEvent,
    );

    if (matching) {
      throw new DuplicateTriggeringEventException();
    }

    if (!serializedSnapshot && !events.length) {
      throw new EntityNotFoundException(aggregateType, entityId);
    } else {
      return new LoadedEvents(
        eventsAndTriggers.map(e => e.event),
        serializedSnapshot,
      );
    }
  }

  async update<AR extends AggregateRoot, S extends Snapshot>(
    entityIdAndType: EntityIdAndType,
    entityVersion: string,
    events: readonly EventTypeAndData<any>[],
    options?: AggregateCrudUpdateOptions<AR, S>,
  ): Promise<SaveUpdateResult<AR>> {
    const eventsWithIds = events.map(e => this.toEventId(e));
    const updatedEntityVersion =
      eventsWithIds[eventsWithIds.length - 1].eventId;

    const result = await this.connection
      .createQueryBuilder()
      .update(EntitiesEntity)
      .set({
        version: updatedEntityVersion,
        type: entityIdAndType.entityType.name,
        id: entityIdAndType.entityId,
      })
      .where(
        'id = :entityId AND type = :entityType AND version = :entityVersion',
        {
          ...entityIdAndType,
          entityVersion,
        },
      )
      .execute();

    if (result?.affected != 1) {
      throw new OptimisticLockingException();
    }

    if (options?.snapshot) {
      const previousSnapshot = await this.connection
        .createQueryBuilder()
        .select('*')
        .from(SnapshotsEntity, 'user')
        .where(
          'snapshots.entityType = :entityType and snapshots.entityId = :entityId',
        )
        .orderBy('entityVersion', 'DESC')
        .setParameters(entityIdAndType)
        .limit(1)
        .getOne();

      let oldEvents: readonly EventsEntity<any, any>[];
      if (previousSnapshot) {
        oldEvents = await this.events
          .createQueryBuilder()
          .where(
            'entityType = :entityType AND entityId = :entityId AND eventId > :eventId',
          )
          .orderBy('eventId', 'ASC')
          .setParameters({
            eventId: previousSnapshot.entityVersion,
            ...entityIdAndType,
          })
          .getMany();
      } else {
        oldEvents = await this.events
          .createQueryBuilder()
          .where('entityType = :entityType and entityId = :entityId')
          .setParameters(entityIdAndType)
          .getMany();
      }

      const eventsAndTriggers: readonly EventAndTrigger<any>[] = oldEvents.map(
        e => ({
          event: {
            ...e,
            // TODO
            eventType: class {},
          },
          triggeringEvent: e.triggeringEvent!,
        }),
      );

      const triggeringEvents = SnapshotTriggeringEvents.create(
        eventsAndTriggers,
      );

      await this.snapshots.save({
        entityId: entityIdAndType.entityId,
        entityType: entityIdAndType.entityType.name,
        entityVersion: updatedEntityVersion,
        snapshotType: previousSnapshot?.snapshotType,
        snapshotJson: previousSnapshot?.snapshotJson,
        triggeringEvents,
      });
    }

    await this.connection.transaction(manager =>
      Promise.all(
        eventsWithIds.map(event =>
          manager.create(EventsEntity, {
            eventId: event.eventId,
            eventData: event.eventData,
            eventType: event.eventType.name,
            triggeringEvent: options?.triggeringEvent?.eventToken,
            metadata: event.metadata,
            entityId: entityIdAndType.entityId,
            entityType: entityIdAndType.entityType.name,
          }),
        ),
      ),
    );

    return new SaveUpdateResult(
      {
        entityId: entityIdAndType.entityId,
        entityVersion: updatedEntityVersion,
        eventIds: eventsWithIds.map(e => e.eventId),
      },
      {
        aggregateType: entityIdAndType.entityType,
        entityId: entityIdAndType.entityId,
        eventsWithIds,
      },
    );
  }
}
