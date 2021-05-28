import { BigIntType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ConsumedMessage {
  @PrimaryKey()
  consumerId: string;

  @PrimaryKey()
  messageId: string;

  @Property({ type: BigIntType })
  creationTime: number = Date.now();
}
