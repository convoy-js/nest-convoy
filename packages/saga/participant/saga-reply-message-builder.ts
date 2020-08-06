import { LockTarget } from '@nest-convoy/saga/common';
import {
  CommandReplyOutcome,
  ReplyMessageHeaders,
} from '@nest-convoy/commands/common';
import { withReply } from '@nest-convoy/commands/consumer';

import { SagaReplyMessage } from './saga-reply-message';

export class SagaReplyMessageBuilder /*extends CommandHandlerReplyBuilder*/ {
  constructor(private readonly lockTarget: LockTarget) {
    // super();
  }

  static withLock(type: object, id: object) {
    return new SagaReplyMessageBuilder(new LockTarget(type, id));
  }

  with<T>(reply: T, outcome: CommandReplyOutcome): SagaReplyMessage {
    const message = withReply(reply, outcome);
    // this.body = JSON.stringify(reply);
    // message.withHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome);
    // message.withHeader(ReplyMessageHeaders.REPLY_TYPE, reply.constructor.name);

    return new SagaReplyMessage(
      message.getPayload(),
      message.getHeaders(),
      this.lockTarget,
    );
  }
}
