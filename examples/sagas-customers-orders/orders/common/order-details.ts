import { Column, Entity } from 'typeorm';

import { Money } from '../../../sagas-customers-orders/common/money';

export class OrderDetails {
  @Column()
  customerId: number;

  @Column(() => Money)
  orderTotal: Money;
}
