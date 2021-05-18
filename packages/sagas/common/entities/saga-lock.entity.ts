import { Property, Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class SagaLock {
  @PrimaryKey()
  target: string;

  @Property()
  sagaId: string;

  @Property()
  sagaType: string;

  @Property({ version: true })
  version: number;
}
