import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('saga_lock')
export class SagaLockEntity {
  @PrimaryColumn()
  target: string;

  @Column({ name: 'saga_id' })
  sagaId: string;

  @Column({ name: 'saga_type' })
  sagaType: string;
}
