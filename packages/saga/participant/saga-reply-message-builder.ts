import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { Type } from '@nestjs/common';
import { MessageBuilder } from '@nest-convoy/messaging/producer';
import { LockTarget } from '@nest-convoy/saga/common';
import {
  CommandReplyOutcome,
  ReplyMessageHeaders,
  Success,
} from '@nest-convoy/commands/common';
import { CommandHandlerReplyBuilder } from '@nest-convoy/commands/consumer';

import { SagaReplyMessage } from './saga-reply-message';

export class SagaReplyMessageBuilder extends CommandHandlerReplyBuilder {
  constructor(private readonly lockTarget: LockTarget) {
    super();
  }

  static withLock(type: object, id: object) {
    return new SagaReplyMessageBuilder(new LockTarget(type, id));
  }

  with<T>(reply: T, outcome: CommandReplyOutcome): SagaReplyMessage {
    const message = super.with(reply, outcome);
    // this.body = JSON.stringify(reply);
    // this.withHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome);
    // this.withHeader(ReplyMessageHeaders.REPLY_TYPE, reply.constructor.name);
    return new SagaReplyMessage(
      message.getPayload(),
      message.getHeaders(),
      this.lockTarget,
    );
  }
}
