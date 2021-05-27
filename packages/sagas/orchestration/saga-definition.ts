import type { Message } from '@nest-convoy/messaging';

import type { SagaActions } from './saga-actions';
import type { SagaExecutionState } from './saga-execution-state';

export interface SagaDefinition<Data> {
  start(sagaData: Data): Promise<SagaActions<Data>>;
  handleReply(
    currentState: SagaExecutionState,
    sagaData: Data,
    message: Message,
  ): Promise<SagaActions<Data>>;
}
