import { uuid } from '@deepkit/type';
import { Entity, JsonType, PrimaryKey, Property } from '@mikro-orm/core';

import type { ObjectLiteral } from '@nest-convoy/common';

@Entity()
export class OutboxEvent<P extends ObjectLiteral> {
  @PrimaryKey({ type: 'uuid' })
  id: string = uuid();

  @PrimaryKey({ type: 'character varying' })
  aggregateId: string;

  @Property({ type: 'character varying' })
  aggregateType: string;

  @Property({ type: 'character varying' })
  eventType: string;

  @Property({ type: 'character varying' })
  type: string;

  @Property({ type: JsonType })
  payload: P;
}
