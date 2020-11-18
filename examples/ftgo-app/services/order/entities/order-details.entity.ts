import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Money } from '@ftgo-app/libs/common';

import { OrderLineItems } from './order-line-items.entity';
import { Order } from './order.entity';

@Entity()
export class OrderDetails {
  @PrimaryColumn()
  customerId: number;

  @PrimaryColumn()
  restaurantId: number;

  @Column(() => Money)
  total: Money;

  @OneToOne(() => Order, order => order.details)
  @JoinColumn()
  order: Order;

  @OneToOne(() => OrderLineItems, lineItems => lineItems.details, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  lineItems: OrderLineItems;
}
