import type { Type, AsyncLike, AsyncLikeFn } from '@nest-convoy/common';
import type { Message } from '@nest-convoy/messaging/common';
import type { StepOutcome } from './step-outcome';

// T should be a registered Event?
export type SagaStepReplyHandler<Data, R = unknown> = AsyncLikeFn<
  [data: Data, reply: R],
  void
>;

export interface SagaStepReply<Data, R = unknown> {
  readonly type: Type<R>;
  readonly handler: SagaStepReplyHandler<Data, R>;
}

export interface SagaStep<Data> {
  isSuccessfulReply(compensating: boolean, message: Message): boolean;
  getReply<T>(
    message: Message,
    compensating: boolean,
  ): SagaStepReply<Data> | void;
  createStepOutcome(data: Data, compensating: boolean): Promise<StepOutcome>;
  hasAction(data: Data): AsyncLike<boolean>;
  hasCompensation(data: Data): AsyncLike<boolean>;
}
