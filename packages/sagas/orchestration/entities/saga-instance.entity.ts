import { Entity, JsonType, PrimaryKey, Property } from '@mikro-orm/core';

@Entity({ tableName: 'saga_instance' })
export class SagaInstanceEntity<Data = any> {
  @PrimaryKey({ unique: true })
  sagaId: string;

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
