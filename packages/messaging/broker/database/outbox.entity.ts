import { Entity, JsonType, PrimaryKey, Property } from '@mikro-orm/core';
import { uuid } from '@deepkit/type';

import { ObjectLiteral } from '@nest-convoy/common';

@Entity()
export class Outbox<P extends ObjectLiteral> {
  @PrimaryKey()
  id = uuid();

  @PrimaryKey()
  aggregateId: string;

  @Property()
  aggregateType: string;

  @Property()
  eventType: string;

  @Property({
    type: JsonType,
  })
  payload: P;
}
