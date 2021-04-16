import { Column, Entity, Index } from 'typeorm';

@Index('cdc_monitoring_pkey', ['readerId'], { unique: true })
@Entity('cdc_monitoring', { schema: 'eventuate' })
export class CdcMonitoring {
  @Column('character varying', {
    primary: true,
    name: 'reader_id',
    length: 1000,
  })
  readerId: string;

  @Column('bigint', { name: 'last_time', nullable: true })
  lastTime: string | null;
}
