import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('entities')
export class EntitiesEntity {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn()
  type: string;

  @Column()
  version: string;
}
