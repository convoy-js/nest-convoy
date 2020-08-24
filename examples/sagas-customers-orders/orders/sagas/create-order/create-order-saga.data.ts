import { Order } from '../../entities';

export class CreateOrderSagaData {
  constructor(
    public orderDetails: Order['details'],
    public orderId?: Order['id'],
    public rejectionReason?: Order['rejectionReason'],
  ) {}
}
