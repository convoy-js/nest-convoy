import { Property, Entity, PrimaryKey, JsonType } from '@mikro-orm/core';

import {
  MessageHeaders,
  MessageHeadersType,
} from '@nest-convoy/messaging/common';

@Entity()
export class SagaStash<P = Record<string, unknown>> {
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
  messagePayload: object;

  @Property({ version: true })
  version: number;
}
