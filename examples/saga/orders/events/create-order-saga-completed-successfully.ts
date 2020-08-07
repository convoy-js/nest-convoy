import { Order } from '../entities';

export class CreateOrderSagaCompletedSuccessfully {
  constructor(readonly orderId: Order['id']) {}
}
