import { Message } from '@nest-convoy/messaging/common';

import { StepOutcome } from './step-outcome';

// T should be a registered Event?
export type SagaStepReplyHandler<Data, T = any> = (
  data: Data,
  reply: T,
) => void;

export interface SagaStep<Data> {
  isSuccessfulReply(compensating: boolean, message: Message): boolean;
  getReplyHandler<T>(
    message: Message,
    compensating: boolean,
  ): void | SagaStepReplyHandler<Data, T>;
  createStepOutcome(data: Data, compensating: boolean): StepOutcome;
  hasAction(data: Data): boolean;
  hasCompensation(data: Data): boolean;
}
