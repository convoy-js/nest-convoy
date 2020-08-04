import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('saga_lock')
export class SagaLockEntity {
  @PrimaryColumn({ length: 100 })
  target: string;

  @Column({ name: 'saga_id', length: 100 })
  sagaId: string;

  @Column({ name: 'saga_type', length: 200 })
  sagaType: string;
}
