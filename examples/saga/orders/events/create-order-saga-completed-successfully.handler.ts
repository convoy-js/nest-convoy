import { DomainEventEnvelope } from '@nest-convoy/events';
import {
  EventsHandler,
  ForAggregateType,
  IEventHandler,
} from '@nest-convoy/cqrs';

import { CreateOrderSagaCompletedSuccessfully } from './create-order-saga-completed-successfully';
import { CreateOrderSaga, LocalCreateOrderSaga } from '../sagas';

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
