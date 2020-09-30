import { Order } from '../../entities';

import { OrderDetails } from '../../entities';

export class CreateOrderSagaData {
  constructor(
    public orderId: Order['id'],
    public orderDetails: Order,
    public ticketId: number,
  ) {}
}
