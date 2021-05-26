import type { ObjectLiteral } from '@nest-convoy/common';
import { Message } from '@nest-convoy/messaging/common';
import type { MessageHeaders } from '@nest-convoy/messaging/common';

import type { LockTarget } from './lock-target';

export class SagaReplyMessage extends Message {
  constructor(
    payload: ObjectLiteral,
    headers: MessageHeaders,
    readonly lockTarget?: LockTarget,
  ) {
    super(payload, headers);
  }
}
