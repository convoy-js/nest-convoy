import type { Message } from '@nest-convoy/messaging';

import type { SagaActions } from './saga-actions';

export interface SagaDefinition<Data> {
  start(sagaData: Data): Promise<SagaActions<Data>>;
  handleReply(
    currentState: string,
    sagaData: Data,
    message: Message,
  ): Promise<SagaActions<Data>>;
}
