import { Entity, PrimaryColumn, VersionColumn } from 'typeorm';

@Entity('saga_instance_participants')
export class SagaInstanceParticipantsEntity {
  @PrimaryColumn({ name: 'saga_id' })
  sagaId: string;

  @PrimaryColumn({ name: 'saga_type' })
  sagaType: string;

  @PrimaryColumn({ name: 'destination' })
  destination: string;

  @PrimaryColumn({ name: 'resource' })
  resource: string;

  @VersionColumn()
  version: string;
}
