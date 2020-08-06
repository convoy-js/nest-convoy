import { Message } from '@nest-convoy/messaging/common';
import { Consumer } from '@nest-convoy/common';
import {
  CommandReplyOutcome,
  ReplyMessageHeaders,
} from '@nest-convoy/commands/common';

import { SagaStep, SagaStepReplyHandler } from './saga-step';
import { LocalStepOutcome } from './step-outcome';

export class LocalStep<Data> implements SagaStep<Data> {
  constructor(
    private readonly handler: Consumer<Data>,
    private readonly compensation?: Consumer<Data>,
  ) {}

  getReplyHandler<T>(
    message: Message,
    compensating: boolean,
  ): void | SagaStepReplyHandler<Data, T> {}

  hasAction(data: Data): boolean {
    return true;
  }

  hasCompensation(data: Data): boolean {
    return !!this.compensation;
  }

  isSuccessfulReply(compensating: boolean, message: Message): boolean {
    // TODO: Make reusable
    return (
      CommandReplyOutcome.SUCCESS ===
      message.getRequiredHeader(ReplyMessageHeaders.REPLY_OUTCOME)
    );
  }

  createStepOutcome(data: Data, compensating: boolean): LocalStepOutcome {
    try {
      if (compensating) {
        this.compensation?.(data);
      } else {
        this.handler(data);
      }

      return new LocalStepOutcome();
    } catch (e) {
      return new LocalStepOutcome(e);
    }
  }
}
