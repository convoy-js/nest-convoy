import { Entity, Property, PrimaryKey, JsonType } from '@mikro-orm/core';

import type { ObjectLiteral } from '@nest-convoy/common';

@Entity()
export class Events<
  Data extends ObjectLiteral = ObjectLiteral,
  Metadata extends ObjectLiteral = ObjectLiteral,
> {
  @PrimaryKey()
  eventId: string;

  @Property({ nullable: true })
  eventType?: string;

  @Property({ type: JsonType })
  eventData: Data;

  @Property()
  entityType: string;

  @Property()
  entityId: string;

  @Property({ nullable: true })
  triggeringEvent?: string;

  @Property({ type: JsonType, nullable: true })
  metadata: Metadata;

  @Property()
  published: boolean;

  @Property({ version: true })
  version: number;
}
