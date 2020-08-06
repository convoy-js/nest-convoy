import { Order } from '../../entities';

export class CreateOrderSagaData {
  orderDetails: Order['details'];
  orderId: Order['id'];
  rejectionReason: Order['rejectionReason'];
}
