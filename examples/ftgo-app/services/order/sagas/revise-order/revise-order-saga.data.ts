import { Money } from '@ftgo-app/libs/common';

import { OrderRevision } from '../../api';
import { Order } from '../../entities';

export class ReviseOrderSagaData {
  orderId: Order['id'];
  customerId: number;
  restaurantId: number;
  orderRevision: OrderRevision;
  revisedOrderTotal: Money;
  expectedVersion?: number;

  constructor(values: Partial<ReviseOrderSagaData>) {
    Object.assign(this, values);
  }
}
