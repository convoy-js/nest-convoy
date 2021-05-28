import { f, t } from '@deepkit/type';
import { Entity, Enum, ManyToOne, Property } from '@mikro-orm/core';

import { BaseEntity } from '../../common';
import { Order } from './order';
import { OrderLineStatus } from './order-line-status';

/**
 * An entity mapping that represents a line item on a {@link Order} entity.
 */
@Entity()
export class OrderLine extends BaseEntity<OrderLine> {
  @Property()
  @f
  item: string;

  @Property()
  @f
  quantity: number;

  @Property({ type: 'float' })
  @f
  totalPrice: number;

  @ManyToOne({
    entity: () => Order,
    inversedBy: order => order.lineItems,
    joinColumn: 'order_id',
  })
  @t
  purchaseOrder: Order;

  @Enum(() => OrderLineStatus)
  @f.enum(OrderLineStatus)
  status: OrderLineStatus = OrderLineStatus.ENTERED;
}
