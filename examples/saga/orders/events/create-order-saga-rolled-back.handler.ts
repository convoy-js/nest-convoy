import {
  DomainEventEnvelope,
  EventsHandler,
  ForAggregateType,
  IEventHandler,
} from '@nest-convoy/core';

import { CreateOrderSagaRolledBack } from './create-order-saga-rolled-back';
import { LocalCreateOrderSaga } from '../sagas';

@EventsHandler(CreateOrderSagaRolledBack)
@ForAggregateType(() => LocalCreateOrderSaga)
export class CreateOrderSagaRolledBackHandler
  implements IEventHandler<CreateOrderSagaRolledBack> {
  async handle(
    dee: DomainEventEnvelope<CreateOrderSagaRolledBack>,
  ): Promise<void> {
    console.log(CreateOrderSagaRolledBackHandler.name, dee);
  }
}
