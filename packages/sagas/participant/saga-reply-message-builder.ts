import { LockTarget } from '@nest-convoy/sagas/common';
import { AggregateRoot } from '@nest-convoy/events';
import { Message } from '@nest-convoy/messaging';
import { withFailure, withSuccess } from '@nest-convoy/commands';

import { SagaReplyMessage } from './saga-reply-message';

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
