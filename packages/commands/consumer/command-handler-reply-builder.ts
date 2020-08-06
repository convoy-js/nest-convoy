import { Message } from '@nest-convoy/messaging/common';
import { MessageBuilder } from '@nest-convoy/messaging/producer';
import {
  ReplyMessageHeaders,
  CommandReplyOutcome,
  Failure,
  Outcome,
  Success,
} from '@nest-convoy/commands/common';

export function withReply<T extends Outcome>(
  reply: T,
  outcome: CommandReplyOutcome,
): Message {
  return MessageBuilder.withPayload(reply)
    .withHeader(ReplyMessageHeaders.REPLY_OUTCOME, outcome)
    .withHeader(ReplyMessageHeaders.REPLY_TYPE, reply.constructor.name)
    .build();
}

export function withSuccess<T extends Outcome>(reply?: T) {
  return withReply(reply ?? new Success(), CommandReplyOutcome.SUCCESS);
}

export function withFailure<T extends Outcome>(reply?: T) {
  return withReply(reply ?? new Failure(), CommandReplyOutcome.FAILURE);
}
