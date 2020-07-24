import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { LockTarget } from '@nest-convoy/saga/common';

export class SagaReplyMessage extends Message {
  constructor(
    body: string,
    headers: MessageHeaders,
    readonly lockTarget?: LockTarget,
  ) {
    super(body, headers);
  }
}
