import { Column, Entity, Index } from 'typeorm';

@Index('spatial_ref_sys_pkey', ['srid'], { unique: true })
@Entity('spatial_ref_sys', { schema: 'inventory' })
export class SpatialRefSys {
  @Column('integer', { primary: true, name: 'srid' })
  srid: number;

  @Column('character varying', {
    name: 'auth_name',
    nullable: true,
    length: 256,
  })
  authName: string | null;

  @Column('integer', { name: 'auth_srid', nullable: true })
  authSrid: number | null;

  @Column('character varying', { name: 'srtext', nullable: true, length: 2048 })
  srtext: string | null;

  @Column('character varying', {
    name: 'proj4text',
    nullable: true,
    length: 2048,
  })
  proj4text: string | null;
}
