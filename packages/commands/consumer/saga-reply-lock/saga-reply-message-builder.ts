import { AggregateRoot } from '@nest-convoy/events/aggregate';
import { Message } from '@nest-convoy/messaging/common';

import { withFailure, withSuccess } from '../command-handler-reply-builder';
import { SagaReplyMessage } from './saga-reply-message';
import { LockTarget } from './lock-target';

export class SagaReplyMessageBuilder {
  constructor(private readonly lockTarget: LockTarget) {}

  withSuccess<T>(reply?: T): Message {
    const message = withSuccess(reply);

    return new SagaReplyMessage(
      message.getPayload(),
      message.getHeaders(),
      this.lockTarget,
    );
  }

  withFailure<T>(reply?: T): Message {
    const message = withFailure(reply);

    return new SagaReplyMessage(
      message.getPayload(),
      message.getHeaders(),
      this.lockTarget,
    );
  }
}

export function withLock<T extends AggregateRoot>(
  aggregate: T,
): SagaReplyMessageBuilder {
  const lockTarget = new LockTarget(aggregate.constructor, aggregate.id);
  return new SagaReplyMessageBuilder(lockTarget);
}
