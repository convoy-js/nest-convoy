import { Injectable, Type } from '@nestjs/common';

import { hashCode } from '@nest-convoy/common';

import { AggregateCrudAccess } from './aggregate-crud-access';
import { LoadedEvents } from '../loaded-events';
import { AggregateRoot } from '../aggregate-root';
import { SerializedEvent } from '../serialized-event';
import { EventContext } from '../event-context';
import { Snapshot } from '../snapshot';
import {
  AggregateCrudUpdateOptions,
  AggregateCrudSaveOptions,
  AggregateCrudFindOptions,
} from './interfaces';
import {
  PublishableEvents,
  EntityIdVersionAndEventIds,
  EventTypeAndData,
  EntityIdAndType,
} from '../interfaces';
import {
  AggregateEvents,
  AggregatesAndEvents,
  SubscriberOptions,
  SubscriptionHandler,
} from '../aggregate-events';

export const AGGREGATE_CRUD = Symbol('__aggregateCrud__');

export interface AggregateCrud {
  save<AR extends AggregateRoot>(
    aggregateType: AR,
    events: readonly EventTypeAndData<any>[],
    options?: AggregateCrudSaveOptions,
  ): Promise<EntityIdVersionAndEventIds>;
  find<AR extends AggregateRoot>(
    aggregateType: Type<AR>,
    entityId: string,
    options?: AggregateCrudFindOptions,
  ): Promise<LoadedEvents>;
  update<AR extends AggregateRoot, S extends Snapshot>(
    entityIdAndType: EntityIdAndType,
    entityVersion: string,
    events: readonly EventTypeAndData<any>[],
    options?: AggregateCrudUpdateOptions<AR, S>,
  ): Promise<EntityIdVersionAndEventIds>;
}

@Injectable()
abstract class DatabaseAggregateCrud implements AggregateCrud {
  constructor(protected readonly access: AggregateCrudAccess) {}

  protected async publish<AR extends AggregateRoot>(
    publishableEvents: PublishableEvents<AR>,
  ): Promise<void> {}

  async find<AR extends AggregateRoot>(
    aggregateType: Type<AR>,
    entityId: string,
    options?: AggregateCrudFindOptions,
  ): Promise<LoadedEvents> {
    return this.access.find(aggregateType, entityId, options);
  }

  async save<AR extends AggregateRoot>(
    aggregate: AR,
    events: readonly EventTypeAndData<any>[],
    options?: AggregateCrudSaveOptions,
  ): Promise<EntityIdVersionAndEventIds> {
    const result = await this.access.save(aggregate, events, options);
    await this.publish(result.publishableEvents);
    return result.entityIdVersionAndEventIds;
  }

  async update<AR extends AggregateRoot, S extends Snapshot>(
    entityIdAndType: EntityIdAndType,
    entityVersion: string,
    events: readonly EventTypeAndData<any>[],
    options?: AggregateCrudUpdateOptions<AR, S>,
  ): Promise<EntityIdVersionAndEventIds> {
    const result = await this.access.update(
      entityIdAndType,
      entityVersion,
      events,
      options,
    );
    await this.publish(result.publishableEvents);
    return result.entityIdVersionAndEventIds;
  }
}

export class Subscription {
  constructor(
    private readonly subscriberId: string,
    private readonly aggregatesAndEvents: AggregatesAndEvents,
    readonly handler: SubscriptionHandler,
  ) {}

  isInterestedIn<AR extends AggregateRoot, E>(
    aggregateType: string,
    eventType: Type<E>,
  ): boolean {
    const [, events] = this.aggregatesAndEvents.get(aggregateType) || [];
    return !!events?.has(eventType);
  }
}

@Injectable()
export class AggregateEventsCrud
  extends DatabaseAggregateCrud
  implements AggregateEvents {
  private readonly aggregateSubscriptions = new Map<
    string,
    Set<Subscription>
  >();
  private eventOffset = 0;

  async publish<AR extends AggregateRoot>({
    eventsWithIds,
    aggregateType,
    entityId: aggregateId,
  }: PublishableEvents<AR>): Promise<void> {
    const subscriptions = this.aggregateSubscriptions.get(aggregateType.name);

    if (subscriptions) {
      for (const subscription of subscriptions.values()) {
        for (const {
          eventType,
          eventId,
          eventData,
          metadata,
        } of eventsWithIds) {
          if (subscription.isInterestedIn(aggregateType.name, eventType)) {
            await subscription.handler(
              new SerializedEvent(
                eventId,
                aggregateId,
                aggregateType,
                eventData,
                eventType,
                hashCode(aggregateId) % 8,
                // TODO: Fix this.eventOffset++,
                BigInt(1),
                new EventContext(eventId),
                metadata,
              ),
            );
          }
        }
      }
    }
  }

  async subscribe(
    subscriberId: string,
    aggregatesAndEvents: AggregatesAndEvents,
    options: SubscriberOptions,
    handler: SubscriptionHandler,
  ): Promise<void> {
    const subscription = new Subscription(
      subscriberId,
      aggregatesAndEvents,
      handler,
    );

    aggregatesAndEvents.forEach((events, aggregateType) => {
      let existing = this.aggregateSubscriptions.get(aggregateType);
      if (!existing) {
        existing = new Set<Subscription>();
        this.aggregateSubscriptions.set(aggregateType, existing);
      }
      existing.add(subscription);
    });
  }
}
