import { Message } from '@nest-convoy/messaging/common';
import { SagaActions } from './saga-actions';

export interface SagaDefinition<Data> {
  start(sagaData: Data): SagaActions<Data>;
  handleReply(
    currentState: string,
    sagaData: Data,
    message: Message,
  ): SagaActions<Data>;
}
