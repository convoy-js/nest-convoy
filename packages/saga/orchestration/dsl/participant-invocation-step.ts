import { Message } from '@nest-convoy/messaging/common';
import { ReplyMessageHeaders } from '@nest-convoy/commands/common';

import { SagaStep, SagaStepReplyHandler } from './saga-step';
import { BaseParticipantInvocation } from './participant-invocation';
import { RemoteStepOutcome, StepOutcome } from './step-outcome';

export type ReplyHandlers<Data> = Map<string, SagaStepReplyHandler<Data>>;

export class ParticipantInvocationStep<Data> implements SagaStep<Data> {
  constructor(
    private readonly actionReplyHandlers: ReplyHandlers<Data>,
    private readonly compensationReplyHandlers: ReplyHandlers<Data>,
    private readonly participantInvocation?: BaseParticipantInvocation<Data>,
    private readonly compensation?: BaseParticipantInvocation<Data>,
  ) {}

  private getParticipantInvocation(
    compensation: boolean,
  ): BaseParticipantInvocation<Data> {
    return compensation ? this.compensation : this.participantInvocation;
  }

  hasAction(data: Data): boolean {
    return this.participantInvocation?.isInvocable(data);
  }

  hasCompensation(data: Data): boolean {
    return this.compensation?.isInvocable(data);
  }

  getReplyHandler<T>(
    message: Message,
    compensating: boolean,
  ): void | SagaStepReplyHandler<Data, unknown> {
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

  createStepOutcome(data: Data, compensating: boolean): StepOutcome {
    const invocation = this.getParticipantInvocation(compensating);
    const command = invocation.createCommandToSend(data);

    return new RemoteStepOutcome([command]);
  }
}
