import { f, uuid } from '@deepkit/type';
import { PrimaryKey, Property } from '@mikro-orm/core';

import {
  AggregateId,
  AggregateRoot,
  AggregateVersion,
} from '@nest-convoy/events/aggregate';

export class BaseEntity<E> /*extends AggregateRoot<E>*/ {
  @PrimaryKey({ type: 'uuid' })
  @AggregateId()
  @f
  id: string = uuid();

  @Property({ version: true })
  @AggregateVersion()
  version: number;
}
