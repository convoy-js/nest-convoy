import { Column, Entity, Index } from 'typeorm';

@Index('events_idx', ['entityId', 'entityType', 'eventId'], {})
@Index('entities_idx', ['entityId', 'entityType'], {})
@Index('events_pkey', ['eventId'], { unique: true })
@Index('events_published_idx', ['eventId', 'published'], {})
@Entity('events', { schema: 'eventuate' })
export class Events {
  @Column('character varying', {
    primary: true,
    name: 'event_id',
    length: 1000,
  })
  eventId: string;

  @Column('character varying', {
    name: 'event_type',
    nullable: true,
    length: 1000,
  })
  eventType: string | null;

  @Column('character varying', { name: 'event_data', length: 1000 })
  eventData: string;

  @Column('character varying', { name: 'entity_type', length: 1000 })
  entityType: string;

  @Column('character varying', { name: 'entity_id', length: 1000 })
  entityId: string;

  @Column('character varying', {
    name: 'triggering_event',
    nullable: true,
    length: 1000,
  })
  triggeringEvent: string | null;

  @Column('character varying', {
    name: 'metadata',
    nullable: true,
    length: 1000,
  })
  metadata: string | null;

  @Column('smallint', { name: 'published', nullable: true, default: () => '0' })
  published: number | null;
}
