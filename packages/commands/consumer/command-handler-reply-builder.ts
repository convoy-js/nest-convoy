import { Message } from '@nest-convoy/messaging/common';
import { MessageBuilder } from '@nest-convoy/messaging/producer';
import { Reply } from '@nest-convoy/common';
import {
  ReplyMessageHeaders,
  CommandReplyOutcome,
  Failure,
  Success,
} from '@nest-convoy/commands/common';

export function withReply<T extends Reply>(
  reply: T,
  outcome: CommandReplyOutcome,
): Message {
  return MessageBuilder.withPayload(reply)
    .withReference(reply)
    .withHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome)
    .withHeader(ReplyMessageHeaders.REPLY_TYPE, reply.constructor.name)
    .build();
}

export function withSuccess<T>(reply?: T): Message {
  return withReply(reply ?? new Success(), CommandReplyOutcome.SUCCESS);
}

export function withFailure<T>(reply?: T): Message {
  return withReply(reply ?? new Failure(), CommandReplyOutcome.FAILURE);
}
