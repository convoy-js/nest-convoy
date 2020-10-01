import { Type } from '@nestjs/common';

import { Message } from '@nest-convoy/messaging/common';

import { StepOutcome } from './step-outcome';

// T should be a registered Event?
export type SagaStepReplyHandler<Data, R = unknown> = (
  data: Data,
  reply: R,
) => void;

export interface SagaStepReply<Data, R = unknown> {
  type: Type<any>;
  handler: SagaStepReplyHandler<Data, R>;
}

export interface SagaStep<Data> {
  isSuccessfulReply(compensating: boolean, message: Message): boolean;
  getReply<T>(
    message: Message,
    compensating: boolean,
  ): SagaStepReply<Data> | void;
  createStepOutcome(data: Data, compensating: boolean): Promise<StepOutcome>;
  hasAction(data: Data): Promise<boolean> | boolean;
  hasCompensation(data: Data): Promise<boolean> | boolean;
}
