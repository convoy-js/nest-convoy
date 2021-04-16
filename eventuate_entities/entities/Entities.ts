import { Column, Entity, Index } from 'typeorm';

@Index('entities_pkey', ['entityId', 'entityType'], { unique: true })
@Entity('entities', { schema: 'eventuate' })
export class Entities {
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

  @Column('character varying', { name: 'entity_version', length: 1000 })
  entityVersion: string;
}
