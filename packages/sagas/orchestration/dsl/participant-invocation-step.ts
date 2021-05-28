import { ReplyMessageHeaders } from '@nest-convoy/commands/common';
import { RuntimeException } from '@nest-convoy/common';
import type { Message } from '@nest-convoy/messaging/common';

import type { BaseParticipantInvocation } from './participant-invocation';
import type { SagaStep, SagaStepReply } from './saga-step';
import type { StepOutcome } from './step-outcome';
import { RemoteStepOutcome } from './step-outcome';

export type ReplyHandlers<Data> = Map<string, SagaStepReply<Data, any>>;

export class ParticipantInvocationStep<Data> implements SagaStep<Data> {
  constructor(
    private readonly actionReplyHandlers: ReplyHandlers<Data>,
    private readonly compensationReplyHandlers: ReplyHandlers<Data>,
    private readonly participantInvocation?: BaseParticipantInvocation<Data>,
    private readonly compensation?: BaseParticipantInvocation<Data>,
  ) {}

  private getParticipantInvocation(
    compensating: boolean,
  ): BaseParticipantInvocation<Data> | undefined {
    return compensating ? this.compensation : this.participantInvocation;
  }

  async hasAction(data: Data): Promise<boolean> {
    return (
      (await this.participantInvocation?.isInvocable?.(data)) ??
      !!this.participantInvocation
    );
  }

  async hasCompensation(data: Data): Promise<boolean> {
    return (
      (await this.compensation?.isInvocable?.(data)) ?? !!this.compensation
    );
  }

  getReply<T>(
    message: Message,
    compensating: boolean,
  ): SagaStepReply<Data> | undefined {
    const replyType = message.getRequiredHeader(ReplyMessageHeaders.REPLY_TYPE);
    const replyHandlers = compensating
      ? this.compensationReplyHandlers
      : this.actionReplyHandlers;

    return replyHandlers.get(replyType);
  }

  isSuccessfulReply(compensating: boolean, message: Message): boolean {
    return !!this.getParticipantInvocation(compensating)?.isSuccessfulReply(
      message,
    );
  }

  async createStepOutcome(
    data: Data,
    compensating: boolean,
  ): Promise<StepOutcome> {
    const invocation = this.getParticipantInvocation(compensating);
    if (!invocation) {
      throw new RuntimeException('Invocation missing');
    }
    const command = await invocation.createCommandToSend(data);

    return new RemoteStepOutcome([command]);
  }
}
