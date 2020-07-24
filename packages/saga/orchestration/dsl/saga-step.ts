import { Message } from '@nest-convoy/messaging/common';

export interface SagaStep<Data> {
  isSuccessfulReply(compensating: boolean, message: Message): boolean;

  getReplyHandler(message: Message, compensating: boolean): Function:

  makeStepOutcome()
}
