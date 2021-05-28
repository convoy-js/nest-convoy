import type { Type } from '@nestjs/common';

import type { AggregateRoot } from './aggregate-root';

export const EVENT_AGGREGATE_META = Symbol('EVENT_AGGREGATE_META');

export function EventAggregate<AR extends AggregateRoot>(
  entity: Type<AR>,
): ClassDecorator {
  return target => {
    Reflect.defineMetadata(EVENT_AGGREGATE_META, entity, target);
  };
}
