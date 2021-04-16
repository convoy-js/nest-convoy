import { Column, Entity, Index } from 'typeorm';

@Index('snapshots_pkey', ['entityId', 'entityType', 'entityVersion'], {
  unique: true,
})
@Entity('snapshots', { schema: 'eventuate' })
export class Snapshots {
  @Column('character varying', {
    primary: true,
    name: 'entity_type',
    length: 1000,
  })
  entityType: string;

  @Column('character varying', {
    primary: true,
    name: 'entity_id',
    length: 1000,
  })
  entityId: string;

  @Column('character varying', {
    primary: true,
    name: 'entity_version',
    length: 1000,
  })
  entityVersion: string;

  @Column('character varying', { name: 'snapshot_type', length: 1000 })
  snapshotType: string;

  @Column('character varying', { name: 'snapshot_json', length: 1000 })
  snapshotJson: string;

  @Column('character varying', {
    name: 'triggering_events',
    nullable: true,
    length: 1000,
  })
  triggeringEvents: string | null;
}
