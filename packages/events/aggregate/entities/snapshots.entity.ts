import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('snapshots')
export class SnapshotsEntity {
  @PrimaryColumn({ name: 'entity_type' })
  entityType: string;

  @PrimaryColumn({ name: 'entity_id' })
  entityId: string;

  @PrimaryColumn({ name: 'entity_version' })
  entityVersion: string;

  @Column({ name: 'snapshot_type' })
  snapshotType: string;

  @Column({ name: 'snapshot_json', type: 'simple-json' })
  snapshotJson: Record<string, unknown>;

  @Column({
    name: 'triggering_events',
    nullable: true,
  })
  triggeringEvents?: string;
}
