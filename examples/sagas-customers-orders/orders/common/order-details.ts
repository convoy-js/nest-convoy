import { Column } from 'typeorm';

import { Money } from '../../common';

export class OrderDetails {
  @Column()
  customerId: number;

  @Column(() => Money)
  orderTotal: Money;
}
