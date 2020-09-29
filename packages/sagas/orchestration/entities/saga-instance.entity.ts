import {
  PrimaryGeneratedColumn,
  Column,
  Entity,
  PrimaryColumn,
  VersionColumn,
} from 'typeorm';

@Entity('saga_instance')
export class SagaInstanceEntity<Data = any> {
  @PrimaryGeneratedColumn({ name: 'saga_id' })
  sagaId: string;

  @PrimaryColumn({ name: 'saga_type' })
  sagaType: string;

  @Column({ name: 'state_name' })
  stateName: string;

  @Column({ name: 'compensating', default: false })
  compensating: boolean;

  @Column({ name: 'end_state', default: false })
  endState: boolean;

  @Column({ name: 'saga_data_type' })
  sagaDataType: string;

  @Column({
    name: 'saga_data',
    type: 'simple-json',
  })
  sagaData: Data;

  @Column({ name: 'last_request_id', nullable: true })
  lastRequestId?: string;

  @VersionColumn()
  version: string;
}
