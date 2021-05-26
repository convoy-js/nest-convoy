import { Property, Entity, PrimaryKey, JsonType } from '@mikro-orm/core';

import type { ObjectLiteral } from '@nest-convoy/common';
import {
  MessageHeaders,
  MessageHeadersType,
} from '@nest-convoy/messaging/common';

@Entity()
export class SagaStash<P = ObjectLiteral> {
  @PrimaryKey()
  messageId: string;

  @Property()
  target: string;

  @Property()
  sagaType: string;

  @Property()
  sagaId: string;

  @Property({
    type: MessageHeadersType,
  })
  messageHeaders: MessageHeaders;

  @Property({ type: JsonType })
  messagePayload: P;

  @Property({ version: true })
  version: number;
}
