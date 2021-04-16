import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('cdc_monitoring')
export class CdcMonitoringEntity {
  @PrimaryColumn({
    name: 'reader_id',
  })
  readerId: string;

  @Column({
    type: 'bigint',
    name: 'last_time',
    nullable: true,
    // transformer: {
    //   from(value: Date): number {
    //     return +value;
    //   },
    //   to(value: number): Date {
    //     return new Date(value);
    //   },
    // },
  })
  lastTime?: number;
}
