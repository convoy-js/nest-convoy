import { Order } from '../../entities';

export class CreateOrderSagaData {
  // rejectionReason: Order['rejectionReason'];

  constructor(
    public orderId?: Order['id'],
    public orderDetails?: Order['details'],
  ) {}
}
