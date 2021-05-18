import {
  PrimaryKey,
  Entity,
  Property,
  PrimaryKeyType,
  JsonType,
} from '@mikro-orm/core';

import {
  SnapshotTriggeringEvents,
  SnapshotTriggeringEventsType,
} from '../snapshot';

@Entity({ tableName: 'snapshots' })
export class Snapshots {
  @PrimaryKey()
  entityType: string;

  @PrimaryKey()
  entityId: string;

  @PrimaryKey()
  entityVersion: string;

  [PrimaryKeyType]: [string, string, string];

  @Property()
  snapshotType: string;

  @Property({ type: JsonType })
  snapshotJson: Record<string, unknown>;

  @Property({
    type: SnapshotTriggeringEventsType,
  })
  triggeringEvents: SnapshotTriggeringEvents;
}
