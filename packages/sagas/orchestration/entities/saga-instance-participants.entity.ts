import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class SagaInstanceParticipants {
  @PrimaryKey()
  sagaId: string;

  @PrimaryKey()
  sagaType: string;

  @PrimaryKey()
  destination: string;

  @PrimaryKey()
  resource: string;

  @Property({ version: true })
  version: number;
}
