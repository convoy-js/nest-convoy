import { Column, PrimaryColumn, Index, Entity, VersionColumn } from 'typeorm';

@Index('events_idx', ['entityType', 'entityId', 'eventId'])
@Index('events_published_idx', ['published', 'eventId'])
@Index('entities_idx', ['entityType', 'entityId'])
@Entity('events')
export class EventsEntity<Data, Metadata = unknown> {
  @PrimaryColumn('event_id')
  eventId: string;

  @Column({ name: 'event_type', nullable: true })
  eventType?: string;

  @Column({
    name: 'event_data',
    type: 'simple-json',
  })
  eventData: Data;

  @Column('entity_type')
  entityType: string;

  @Column('entity_id')
  entityId: string;

  @Column({ name: 'triggering_event', nullable: true })
  triggeringEvent?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Metadata;

  @Column()
  published: boolean;

  @VersionColumn()
  version: string;
}
