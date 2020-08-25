import { LockTarget } from '@nest-convoy/sagas/common';
import { CommandReplyOutcome } from '@nest-convoy/commands/common';
import { withReply } from '@nest-convoy/commands/consumer';
import { Instance, Reply } from '@nest-convoy/common';

import { SagaReplyMessage } from './saga-reply-message';

export class SagaReplyMessageBuilder /*extends CommandHandlerReplyBuilder*/ {
  static withLock(type: Instance, id: Instance): SagaReplyMessageBuilder {
    return new SagaReplyMessageBuilder(new LockTarget(type, id));
  }

  constructor(private readonly lockTarget: LockTarget) {
    // super();
  }

  with<T extends Reply>(
    reply: T,
    outcome: CommandReplyOutcome,
  ): SagaReplyMessage {
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
