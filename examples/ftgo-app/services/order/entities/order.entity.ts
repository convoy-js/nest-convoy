import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm/index';

import { Money } from '@ftgo-app/libs/common';

import { OrderLineItem } from './order-line-item.entity';
import { DeliveryInfo } from './delivery-info.entity';
import { PaymentInfo } from './payment-info.entity';

export enum OrderState {
  APPROVAL_PENDING = 'APPROVAL_PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCEL_PENDING = 'CANCEL_PENDING',
  CANCELLED = 'CANCELLED',
  REVISION_PENDING = 'REVISION_PENDING',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  consumerId: number;

  @PrimaryColumn()
  restaurantId: number;

  @OneToMany(() => OrderLineItem, lineItem => lineItem.order, {
    cascade: true,
    eager: true,
  })
  @JoinTable()
  lineItems: OrderLineItem[];

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.APPROVAL_PENDING,
  })
  state: OrderState;

  @Column(() => DeliveryInfo)
  deliveryInfo: DeliveryInfo;

  @Column(() => PaymentInfo)
  paymentInfo: PaymentInfo;

  @Column(() => Money)
  minimum: Money = new Money(20);
}
