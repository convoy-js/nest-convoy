import { Order } from '../entities';

export class CreateOrderSagaRolledBack {
  constructor(readonly orderId: Order['id']) {}
}
