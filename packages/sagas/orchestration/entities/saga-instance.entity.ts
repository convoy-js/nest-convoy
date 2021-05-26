import { uuid } from '@deepkit/type';
import { Entity, JsonType, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class SagaInstance<Data = any> {
  @PrimaryKey()
  sagaId = uuid();

  @PrimaryKey()
  sagaType: string;

  @Property()
  stateName: string;

  @Property()
  compensating = false;

  @Property()
  endState = false;

  @Property()
  sagaDataType: string;

  @Property({ type: JsonType })
  sagaData: Data;

  @Property({ nullable: true })
  lastRequestId?: string;

  @Property({ version: true })
  version: number;
}
