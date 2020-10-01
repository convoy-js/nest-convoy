import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm/index';

import { LineItem, Money } from '@ftgo-app/libs/common';

import { OrderLineItems } from './order-line-items.entity';

@Entity()
export class OrderLineItem extends LineItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => OrderLineItems, lineItems => lineItems.lineItems)
  parent: OrderLineItems;

  @Column(() => Money)
  price: Money;

  total(): Money {
    return this.price.multiply(this.quantity);
  }

  deltaForChangedQuantity(newQuantity: number): Money {
    return this.price.multiply(newQuantity - this.quantity);
  }
}
