import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { SagaInstance } from './saga-instance.entity';

@Entity()
export class SagaInstanceParticipant {
  @PrimaryKey()
  destination: string;

  @PrimaryKey()
  resource: string;

  @ManyToOne({
    entity: () => SagaInstance,
    inversedBy: instance => instance.participants,
    joinColumn: 'saga_id',
  })
  sagaInstance: SagaInstance;

  @Property({ version: true })
  version: number;
}
