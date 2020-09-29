import { Column, Entity, PrimaryColumn } from 'typeorm/index';

@Entity('entities')
export class EntitiesEntity {
  @PrimaryColumn({ name: 'entity_type' })
  entityType: string;

  @PrimaryColumn({ name: 'entity_id' })
  entityId: string;

  @Column({ name: 'entity_version' })
  entityVersion: string;
}
