import { Injectable, Type } from '@nestjs/common';

import type { AsyncLikeFn } from '@nest-convoy/common';

import { AggregateRoot } from './aggregate-root';
import type { SerializedEvent } from './serialized-event';

export class AggregatesAndEvents extends Map<
  string,
  [aggregate: Type, events: Set<Type>]
> {}

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

export const AGGREGATE_EVENTS = Symbol('AGGREGATE_EVENTS');

export interface AggregateEvents {
  subscribe(
    subscriberId: string,
    aggregatesAndEvents: AggregatesAndEvents,
    options: SubscriberOptions,
    handler: SubscriptionHandler,
  ): Promise<void>;
}
