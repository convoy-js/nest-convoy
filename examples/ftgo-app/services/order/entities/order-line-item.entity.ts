import { Column, Entity, ManyToOne } from 'typeorm/index';

import { LineItem, Money } from '@ftgo-app/libs/common';
import { Order } from './order.entity';

@Entity()
export class OrderLineItem extends LineItem {
  @ManyToOne(() => Order, order => order.lineItems)
  order: Order;

  @Column(() => Money)
  money: Money;
}
