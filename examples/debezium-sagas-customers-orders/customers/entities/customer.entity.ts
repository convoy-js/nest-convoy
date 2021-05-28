import { f, t, uuid } from '@deepkit/type';
import {
  Cascade,
  Collection,
  Embedded,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';

import { AvroSchema } from '@nest-convoy/kafka';

import { Money, Namespace } from '../../common';
import { CustomerCreditLimitExceeded } from '../api';
import { CreditReservation } from './credit-reservation.entity';

@Entity()
@AvroSchema(Namespace.CUSTOMER)
export class Customer {
  @PrimaryKey()
  @f
  id: string = uuid();

  @Property()
  @f
  name: string;

  @Embedded(() => Money)
  @t
  creditLimit: Money;

  @OneToMany({
    entity: () => CreditReservation,
    mappedBy: creditReservation => creditReservation.customer,
    cascade: [Cascade.ALL],
    eager: true,
  })
  // @f.array(f.type(() => CreditReservation))
  creditReservations = new Collection<CreditReservation>(this);

  availableCredit(): Money {
    const totalReserved = this.creditReservations
      .getItems()
      .reduce(
        (totalReserved, creditReservation) =>
          totalReserved.add(creditReservation.amount),
        new Money(),
      );

    return this.creditLimit.subtract(totalReserved);
  }

  reserveCredit(orderId: string, orderTotal: Money): void {
    if (this.availableCredit().isGreaterThanOrEqual(orderTotal)) {
      this.creditReservations.add(new CreditReservation(orderId, orderTotal));
    } else {
      throw new CustomerCreditLimitExceeded();
    }
  }
}
