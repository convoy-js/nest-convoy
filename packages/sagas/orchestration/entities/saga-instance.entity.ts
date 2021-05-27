import { uuid } from '@deepkit/type';
import {
  Cascade,
  Collection,
  Embedded,
  Entity,
  JsonType,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { SagaExecutionState } from '../saga-execution-state';
import { SagaInstanceParticipants } from './saga-instance-participants.entity';

@Entity()
export class SagaInstance<Data = any> {
  @PrimaryKey()
  sagaId: string = uuid();

  @PrimaryKey()
  sagaType: string;

  @Embedded(() => SagaExecutionState)
  state = new SagaExecutionState();

  @Property()
  sagaDataType: string;

  @Property({ type: JsonType })
  sagaData: Data;

  @Property({ nullable: true })
  lastRequestId?: string;

  @OneToMany({
    entity: () => SagaInstanceParticipants,
    mappedBy: participants => participants.sagaInstance,
    cascade: [Cascade.ALL],
    eager: true,
  })
  participants = new Collection<SagaInstanceParticipants>(this);

  @Property({ version: true })
  version: number;
}
