import { Message } from '@nest-convoy/messaging/common';
import { Consumer } from '@nest-convoy/common';
import {
  CommandReplyOutcome,
  ReplyMessageHeaders,
} from '@nest-convoy/commands/common';

import { SagaStep, SagaStepReply } from './saga-step';
import { LocalStepOutcome } from './step-outcome';

export class LocalStep<Data> implements SagaStep<Data> {
  constructor(
    private readonly handler: Consumer<Data>,
    private readonly compensation?: Consumer<Data>,
  ) {}

  getReply<T>(
    message: Message,
    compensating: boolean,
  ): SagaStepReply<Data> | void {}

  hasAction(data: Data): boolean {
    return true;
  }

  hasCompensation(data: Data): boolean {
    return typeof this.compensation === 'function'
      ? this.compensation?.(data)
      : !!this.compensation;
  }

  isSuccessfulReply(compensating: boolean, message: Message): boolean {
    return (
      CommandReplyOutcome.SUCCESS ===
      message.getRequiredHeader(ReplyMessageHeaders.REPLY_OUTCOME)
    );
  }

  async createStepOutcome(
    data: Data,
    compensating: boolean,
  ): Promise<LocalStepOutcome> {
    try {
      if (compensating) {
        await this.compensation?.(data);
      } else {
        await this.handler(data);
      }

      return new LocalStepOutcome();
    } catch (err) {
      return new LocalStepOutcome(err);
    }
  }
}
