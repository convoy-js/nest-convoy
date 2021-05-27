import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { SagaInstance } from './saga-instance.entity';

@Entity()
export class SagaInstanceParticipants {
  @PrimaryKey()
  destination: string;

  @PrimaryKey()
  resource: string;

  @ManyToOne({
    entity: () => SagaInstance,
    inversedBy: instance => instance.participants,
  })
  sagaInstance: SagaInstance;

  @Property({ version: true })
  version: number;
}
