import { Message } from '@nest-convoy/messaging/common';
import { ReplyMessageHeaders } from '@nest-convoy/commands/common';

import { SagaStep, SagaStepReply } from './saga-step';
import { BaseParticipantInvocation } from './participant-invocation';
import { RemoteStepOutcome, StepOutcome } from './step-outcome';

export type ReplyHandlers<Data> = Map<string, SagaStepReply<Data, any>>;

export class ParticipantInvocationStep<Data> implements SagaStep<Data> {
  constructor(
    private readonly actionReplyHandlers: ReplyHandlers<Data>,
    private readonly compensationReplyHandlers: ReplyHandlers<Data>,
    private readonly participantInvocation?: BaseParticipantInvocation<Data>,
    private readonly compensation?: BaseParticipantInvocation<Data>,
  ) {}

  private getParticipantInvocation(
    compensation: boolean,
  ): BaseParticipantInvocation<Data> | undefined {
    return compensation ? this.compensation : this.participantInvocation;
  }

  hasAction(data: Data): Promise<boolean> | boolean {
    return typeof this.participantInvocation?.isInvocable === 'function'
      ? this.participantInvocation?.isInvocable?.(data)
      : !!this.participantInvocation;
  }

  hasCompensation(data: Data): Promise<boolean> | boolean {
    return typeof this.compensation?.isInvocable === 'function'
      ? this.compensation?.isInvocable?.(data)
      : !!this.compensation;
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
      throw new Error('Invocation missing');
    }
    const command = await invocation.createCommandToSend(data);

    return new RemoteStepOutcome([command]);
  }
}
