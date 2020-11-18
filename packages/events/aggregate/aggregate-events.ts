import { Injectable, Type } from '@nestjs/common';

import { AsyncLikeFn } from '@nest-convoy/common';

import { AggregateRoot } from './aggregate-root';
import { SerializedEvent } from './serialized-event';

export type AggregatesAndEvents = Map<
  string /*Type<AggregateRoot>*/,
  Set<Type<any>>
>;

export type SubscriptionHandler = AsyncLikeFn<[SerializedEvent<any>], void>;

export enum SubscriberDurability {
  DURABLE,
  TRANSIENT,
}

export enum SubscriberInitialPosition {
  BEGINNING,
  END,
}

export interface SubscriberOptions {
  readonly durability: SubscriberDurability;
  readonly readFrom: SubscriberInitialPosition;
  readonly progressNotifications: boolean;
}

export const AGGREGATE_EVENTS = Symbol('__aggregateEvents__');

export interface AggregateEvents {
  subscribe(
    subscriberId: string,
    aggregatesAndEvents: AggregatesAndEvents,
    options: SubscriberOptions,
    handler: SubscriptionHandler,
  ): Promise<void>;
}
