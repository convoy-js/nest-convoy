import {
  DateType,
  Entity,
  JsonType,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { ObjectLiteral } from '@nest-convoy/common';

import { MessageHeaders, MessageHeadersType } from '../message-headers';

@Entity({ tableName: 'message' })
export class MessageEntity<P extends ObjectLiteral = ObjectLiteral> {
  @PrimaryKey()
  id: string;

  @Property({ type: 'text' })
  destination: string;

  @Property({
    type: MessageHeadersType,
    nullable: true,
  })
  headers?: MessageHeaders;

  @Property({ type: JsonType, nullable: true })
  payload?: P;

  @Property()
  published = false;

  @Property({ type: DateType })
  creationTime = new Date();
}
