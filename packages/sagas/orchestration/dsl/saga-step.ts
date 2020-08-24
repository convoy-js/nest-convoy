import { Message } from '@nest-convoy/messaging/common';

import { StepOutcome } from './step-outcome';
import { Type } from '@nestjs/common';

// T should be a registered Event?
export type SagaStepReplyHandler<Data, T = any> = (
  data: Data,
  reply: T,
) => void;

export interface SagaStepReply<Data> {
  type: Type<any>;
  handler: SagaStepReplyHandler<Data>;
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
