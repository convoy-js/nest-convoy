import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('saga_instance')
export class SagaInstanceEntity<Data = any> {
  @PrimaryColumn({ name: 'saga_id', length: 100 })
  sagaId: string;

  @PrimaryColumn({ name: 'saga_type', length: 255 })
  sagaType: string;

  @Column({ name: 'state_name', length: 100 })
  stateName: string;

  @Column({ name: 'compensating', default: false })
  compensating: boolean;

  @Column({ name: 'end_state', default: false })
  endState: boolean;

  @Column({ name: 'saga_data_type', length: 1000 })
  sagaDataType: string;

  @Column({
    name: 'saga_data',
    type: 'simple-json',
  })
  sagaData: Data;

  @Column({ name: 'last_request_id', length: 100, nullable: true })
  lastRequestId?: string;
}
