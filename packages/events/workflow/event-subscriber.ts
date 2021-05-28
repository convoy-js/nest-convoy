import { Injectable } from '@nestjs/common';

import type { SubscriberOptions } from '@nest-convoy/events/aggregate/aggregate-events';
import {
  SubscriberDurability,
  SubscriberInitialPosition,
} from '@nest-convoy/events/aggregate/aggregate-events';

export const EVENT_SUBSCRIBER_META = Symbol('EVENT_SUBSCRIBER_META');

export function EventSubscriber(
  options: Partial<SubscriberOptions> = {},
): ClassDecorator {
  return target => {
    Injectable()(target);
    Reflect.defineMetadata(
      EVENT_SUBSCRIBER_META,
      {
        durability: SubscriberDurability.DURABLE,
        readFrom: SubscriberInitialPosition.BEGINNING,
        progressNotifications: false,
        ...options,
      } as SubscriberOptions,
      target,
    );
  };
}
