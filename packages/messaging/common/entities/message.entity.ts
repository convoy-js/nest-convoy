import { uuid } from '@deepkit/type';
import {
  DateType,
  Entity,
  JsonType,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import type { ObjectLiteral } from '@nest-convoy/common';

import { MessageHeaders, MessageHeadersType } from '../message-headers';

@Entity({ tableName: 'message' })
export class MessageEntity<P extends ObjectLiteral = ObjectLiteral> {
  @PrimaryKey()
  id: string = uuid();

  @Property({ type: 'text' })
  destination: string;

  @Property({
    type: MessageHeadersType,
    nullable: true,
  })
  headers?: MessageHeaders;

  @Property({ type: JsonType, nullable: true })
  payload?: P;

  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Property()
  published: boolean = false;

  @Property({ type: DateType })
  creationTime = new Date();
}
