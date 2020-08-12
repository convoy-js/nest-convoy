import { Order } from '../../entities';

export class CreateOrderSagaData {
  constructor(
    public orderId?: Order['id'],
    public orderDetails?: Order['details'],
    public rejectionReason?: Order['rejectionReason'],
  ) {}
}
