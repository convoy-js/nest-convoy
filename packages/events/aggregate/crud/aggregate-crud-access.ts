import { uuid } from '@deepkit/type';
import { EntityRepository, MikroORM, QueryOrder } from '@mikro-orm/core';
import type { AbstractSqlDriver } from '@mikro-orm/knex';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import type { Type } from '@nest-convoy/common';

import type { AggregateRoot } from '../aggregate-root';
import { Entities, Events, Snapshots } from '../entities';
import {
  DuplicateTriggeringEventException,
  EntityNotFoundException,
  OptimisticLockingException,
} from '../exceptions';
import type {
  EventIdTypeAndData,
  EntityIdAndType,
  EventTypeAndData,
  EventAndTrigger,
} from '../interfaces';
import { LoadedEvents } from '../loaded-events';
import { SaveUpdateResult } from '../save-update-result';
import {
  SerializedSnapshot,
  SnapshotTriggeringEvents,
  SerializedSnapshotWithVersion,
} from '../snapshot';
import type { Snapshot } from '../snapshot';
import type {
  AggregateCrudFindOptions,
  AggregateCrudSaveOptions,
  AggregateCrudUpdateOptions,
} from './interfaces';

@Injectable()
export class AggregateCrudAccess {
  constructor(
    private readonly orm: MikroORM<AbstractSqlDriver>,
    @InjectRepository(Entities)
    private readonly entities: EntityRepository<Entities>,
    @InjectRepository(Events)
    private readonly events: EntityRepository<Events>,
    @InjectRepository(Snapshots)
    private readonly snapshots: EntityRepository<Snapshots>,
  ) {}

  private toEventId(
    eventTypeAndData: EventTypeAndData<any>,
  ): EventIdTypeAndData<any> {
    return {
      eventId: uuid(),
      ...eventTypeAndData,
    };
  }

  async save<AR extends AggregateRoot>(
    aggregate: AR,
    events: readonly EventTypeAndData<any>[],
    options?: AggregateCrudSaveOptions,
  ): Promise<SaveUpdateResult<AR>> {
    const eventsWithIds = events.map(e => this.toEventId(e));
    let entityId = options?.entityId;
    const entityVersion = eventsWithIds[eventsWithIds.length - 1].eventId;
    const entityType = aggregate.constructor.name;

    const entity = this.entities.create({
      type: entityType,
      id: entityId,
      version: entityVersion,
    });
    this.entities.persist(entity);
    entityId = entity.id;

    eventsWithIds.forEach(event => {
      const entity = this.events.create({
        eventId: event.eventId,
        eventData: event.eventData,
        eventType: event.eventType.name,
        triggeringEvent: options?.triggeringEvent?.eventToken,
        metadata: event.metadata,
        entityType,
        entityId,
      });

      this.events.persist(entity);
    });

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
      entityType,
      entityId,
    });

    let events: readonly Events<any, any>[];
    let serializedSnapshot: SerializedSnapshotWithVersion<any> | undefined;

    if (snapshot) {
      serializedSnapshot = new SerializedSnapshotWithVersion(
        new SerializedSnapshot(
          snapshot.snapshotType,
          JSON.stringify(snapshot.snapshotJson),
        ),
        snapshot.entityVersion,
      );

      events = await this.orm.em
        .createQueryBuilder(Events)
        .where({
          entityType,
          entityId,
          eventId: {
            $gt: snapshot.entityVersion,
          },
        })
        .orderBy({
          eventId: QueryOrder.ASC,
        })
        .getResult();
    } else {
      events = await this.events.find({
        entityType,
        entityId,
      });
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
    }

    return new LoadedEvents(
      eventsAndTriggers.map(e => e.event),
      serializedSnapshot,
    );
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

    // TODO - check if it's correct
    const result = await this.orm.em
      .createQueryBuilder(Entities)
      .where({
        type: entityIdAndType.entityType.name,
        id: entityIdAndType.entityId,
        entityVersion,
      })
      .update({
        version: updatedEntityVersion,
        type: entityIdAndType.entityType.name,
        id: entityIdAndType.entityId,
      })
      .getSingleResult();

    // const result = await this.connection
    //   .createQueryBuilder()
    //   .update(Entities)
    //   .set({
    //     version: updatedEntityVersion,
    //     type: entityIdAndType.entityType.name,
    //     id: entityIdAndType.entityId,
    //   })
    //   .where(
    //     'id = :entityId AND type = :entityType AND version = :entityVersion',
    //     {
    //       ...entityIdAndType,
    //       entityVersion,
    //     },
    //   )
    //   .execute();

    if (!result) {
      throw new OptimisticLockingException();
    }

    if (options?.snapshot) {
      const previousSnapshot = await this.orm.em
        .createQueryBuilder(Snapshots)
        .where(entityIdAndType)
        .orderBy({
          entityVersion: QueryOrder.DESC,
        })
        .limit(1)
        .getSingleResult();

      // const previousSnapshot = await this.connection
      //   .createQueryBuilder()
      //   .select('*')
      //   .from(Snapshots, 'user')
      //   .where(
      //     'snapshots.entityType = :entityType and snapshots.entityId = :entityId',
      //   )
      //   .orderBy('entityVersion', 'DESC')
      //   .setParameters(entityIdAndType)
      //   .limit(1)
      //   .getOne();

      let oldEvents: readonly Events<any, any>[];
      if (previousSnapshot) {
        oldEvents = await this.orm.em
          .createQueryBuilder(Events)
          .where({
            entityType: entityIdAndType.entityType.name,
            entityId: entityIdAndType.entityId,
            eventId: {
              $gt: previousSnapshot.entityVersion,
            },
          })
          .orderBy({
            eventId: QueryOrder.ASC,
          })
          .getResult();
      } else {
        oldEvents = await this.events.find({
          entityType: entityIdAndType.entityType.name,
          entityId: entityIdAndType.entityId,
        });
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

      const triggeringEvents =
        SnapshotTriggeringEvents.create(eventsAndTriggers);

      this.snapshots.persist({
        entityId: entityIdAndType.entityId,
        entityType: entityIdAndType.entityType.name,
        entityVersion: updatedEntityVersion,
        snapshotType: previousSnapshot?.snapshotType,
        snapshotJson: previousSnapshot?.snapshotJson,
        triggeringEvents,
      });
    }

    eventsWithIds.forEach(event => {
      const entity = this.events.create({
        eventId: event.eventId,
        eventData: event.eventData,
        eventType: event.eventType.name,
        triggeringEvent: options?.triggeringEvent?.eventToken,
        metadata: event.metadata,
        entityId: entityIdAndType.entityId,
        entityType: entityIdAndType.entityType.name,
      });

      this.events.persist(entity);
    });

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
