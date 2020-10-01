import { Order } from '../../entities';

export class CreateOrderSagaData {
  constructor(
    public orderId: Order['id'],
    public orderDetails: Order['details'],
    public ticketId: number,
  ) {}
}
