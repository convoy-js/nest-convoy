import { Order } from '../../entities';

export class CancelOrderSagaData {
  orderId: Order['id'];
  orderDetails: Omit<Order['details'], 'lineItems'>;
  reverseRequestId: string;
}
