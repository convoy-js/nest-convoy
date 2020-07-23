import { Injectable } from '@nestjs/common';
import { Message } from '@nest-convoy/messaging/common';
import { MessageBuilder } from '@nest-convoy/messaging/producer';
import {
  ReplyMessageHeaders,
  CommandReplyOutcome,
  Failure,
  Outcome,
  Success,
} from '@nest-convoy/commands/common';

@Injectable()
export class CommandHandlerReplyBuilder {
  with<T extends Outcome>(reply: T, outcome: CommandReplyOutcome): Message {
    return MessageBuilder.withPayload(reply.toString())
      .withHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome)
      .withHeader(ReplyMessageHeaders.REPLY_TYPE, reply.constructor.name)
      .build();
  }
  withSuccess<T extends Outcome>(reply?: T) {
    return this.with(reply ?? new Success(), CommandReplyOutcome.SUCCESS);
  }
  withFailure<T extends Outcome>(reply?: T) {
    return this.with(reply ?? new Failure(), CommandReplyOutcome.FAILURE);
  }
}
