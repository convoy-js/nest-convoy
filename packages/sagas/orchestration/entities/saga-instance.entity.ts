import { uuid } from '@deepkit/type';
import {
  Cascade,
  Collection,
  Embedded,
  Entity,
  JsonType,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { SagaExecutionState } from '../saga-execution-state';
import { SagaInstanceParticipant } from './saga-instance-participants.entity';

@Entity()
export class SagaInstance<Data = any> {
  @PrimaryKey()
  id: string = uuid();

  @PrimaryKey()
  type: string;

  @Embedded(() => SagaExecutionState)
  state = new SagaExecutionState();

  @Property()
  dataType: string;

  @Property({ type: JsonType })
  data: Data;

  @Property({ nullable: true })
  lastRequestId?: string;

  @OneToMany({
    entity: () => SagaInstanceParticipant,
    mappedBy: participant => participant.sagaInstance,
    cascade: [Cascade.ALL],
    orphanRemoval: true,
    eager: true,
  })
  participants = new Collection<SagaInstanceParticipant>(this);

  @Property({ version: true })
  version: number;
}
