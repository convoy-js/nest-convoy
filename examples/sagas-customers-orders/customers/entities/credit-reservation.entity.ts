import { f, t, uuid } from '@deepkit/type';
import { Embedded, Entity, PrimaryKey, ManyToOne } from '@mikro-orm/core';

import { AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Money, Namespace } from '../../common';
import { Customer } from './customer.entity';

@Entity()
@AvroSchema(Namespace.CUSTOMER)
export class CreditReservation {
  @PrimaryKey()
  @f
  id: string = uuid();

  @PrimaryKey()
  @f
  orderId: string;

  @Embedded(() => Money)
  @t
  amount: Money;

  @ManyToOne({
    entity: () => Customer,
    inversedBy: customer => customer.creditReservations,
  })
  @f.type(() => Customer)
  customer: Customer;

  constructor(orderId: string, amount: Money) {
    this.orderId = orderId;
    this.amount = amount;
  }
}
