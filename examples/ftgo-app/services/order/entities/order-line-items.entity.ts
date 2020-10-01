import { IllegalArgumentException } from '@nest-convoy/common';
import {
  Entity,
  JoinColumn,
  JoinTable,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm/index';

import { LineItemQuantityChange, Money } from '@ftgo-app/libs/common';

import { OrderRevision } from '../api';
import { OrderDetails } from './order-details.entity';
import { OrderLineItem } from './order-line-item.entity';

@Entity()
export class OrderLineItems {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => OrderLineItem, lineItem => lineItem.parent, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  lineItems: OrderLineItem[];

  @OneToOne(() => OrderDetails, details => details.lineItems)
  @JoinColumn()
  details: OrderDetails;

  orderTotal(): Money {
    return this.lineItems
      .map(li => li.total())
      .reduce(
        (orderTotal, lineItemTotal) => orderTotal.add(lineItemTotal),
        new Money(),
      );
  }

  findOne(lineMenuItemId: number): OrderLineItem | undefined {
    return this.lineItems.find(li => li.menuItemId === lineMenuItemId);
  }

  changeToOrderTotal(revision: OrderRevision): Money {
    return revision.revisedOrderLineItems
      .map(item => {
        const lineItem = this.findOne(item.menuItemId);
        return lineItem!.deltaForChangedQuantity(item.quantity);
      })
      .reduce(
        (orderTotal, lineItemTotal) => orderTotal.add(lineItemTotal),
        new Money(),
      );
  }

  quantityChange(revision: OrderRevision): LineItemQuantityChange {
    const currentOrderTotal = this.orderTotal();
    const delta = this.changeToOrderTotal(revision);
    const newOrderTotal = currentOrderTotal.add(delta);

    return new LineItemQuantityChange({
      currentOrderTotal,
      newOrderTotal,
      delta,
    });
  }

  update(revision: OrderRevision): void {
    this.lineItems.forEach(li => {
      const revised = revision.revisedOrderLineItems.find(
        item => item.menuItemId === li.menuItemId,
      );

      if (!revised) {
        throw new IllegalArgumentException(
          `Menu item ID ${li.menuItemId} not found`,
        );
      }

      li.quantity = revised.quantity;
    });
  }
}
