import { Column, Entity } from 'typeorm';

import { Money } from './money';

export class OrderDetails {
  @Column()
  customerId: string;

  @Column(() => Money)
  orderTotal: Money;
}
