import { DateType, Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class ReceivedMessages {
  @PrimaryKey()
  consumerId: string;

  @PrimaryKey()
  messageId: string;

  @Property({ type: DateType })
  creationTime = new Date();
}
