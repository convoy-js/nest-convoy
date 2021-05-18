import {
  Cascade,
  Entity,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { Customer } from './Customer';

@Entity()
export class CreditReservation {
  @PrimaryKey()
  id!: number;

  @PrimaryKey({ fieldName: 'orderId' })
  orderId!: number;

  @ManyToOne({
    entity: () => Customer,
    fieldName: 'customerId',
    cascade: [],
    nullable: true,
  })
  customerId?: Customer;

  @Property({ columnType: 'float8', fieldName: 'amountAmount' })
  amountAmount!: number;
}
