import { Property, Entity, PrimaryKey } from '@mikro-orm/core';

@Entity()
export class SagaLock {
  @PrimaryKey()
  target: string;

  @PrimaryKey({ unique: true })
  sagaId: string;

  @Property()
  sagaType: string;

  @Property({ version: true })
  version: number;
}
