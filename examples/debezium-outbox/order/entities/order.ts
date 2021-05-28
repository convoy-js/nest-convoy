import { uuid, f } from '@deepkit/type';
import {
  BigIntType,
  Cascade,
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { BaseEntity } from '../../common';
import { OrderLine } from './order-line';

/**
 * An entity mapping that represents a purchase order.
 */
@Entity()
export class Order extends BaseEntity<Order> {
  @Property()
  @f
  customerId: string;

  @Property({ type: BigIntType })
  @f
  created: number = Date.now();

  @OneToMany({
    entity: () => OrderLine,
    mappedBy: ol => ol.purchaseOrder,
    cascade: [Cascade.ALL],
    orphanRemoval: true,
    eager: true,
  })
  @f.array(OrderLine)
  lineItems = new Collection<OrderLine>(this);
}
