import { Entity, PrimaryColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('saga_instance_participants')
export class SagaInstanceParticipantsEntity {
  @PrimaryGeneratedColumn({ name: 'saga_id', type: 'uuid' })
  sagaId: string;

  @PrimaryColumn({ name: 'saga_type', length: 255 })
  sagaType: string;

  @PrimaryColumn({ name: 'destination', length: 100 })
  destination: string;

  @PrimaryColumn({ name: 'resource', length: 100 })
  resource: string;
}
