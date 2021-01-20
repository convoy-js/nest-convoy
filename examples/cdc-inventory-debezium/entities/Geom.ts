import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Index('geom_pkey', ['id'], { unique: true })
@Entity('geom', { schema: 'inventory' })
export class Geom {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('geometry', { name: 'g' })
  g: string;

  @Column('geometry', { name: 'h', nullable: true })
  h: string | null;
}
