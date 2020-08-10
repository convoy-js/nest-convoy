import {
  EventsHandler,
  ForAggregateType,
  IEventHandler,
  DomainEventEnvelope,
} from '@nest-convoy/core';

import { CreateOrderSagaCompletedSuccessfully } from './create-order-saga-completed-successfully';
import { LocalCreateOrderSaga } from '../sagas';

@EventsHandler(CreateOrderSagaCompletedSuccessfully)
@ForAggregateType(() => LocalCreateOrderSaga)
export class CreateOrderSagaCompletedSuccessfullyHandler
  implements IEventHandler<CreateOrderSagaCompletedSuccessfully> {
  handle(
    dee: DomainEventEnvelope<CreateOrderSagaCompletedSuccessfully>,
  ): Promise<void> {
    return undefined;
  }
}
