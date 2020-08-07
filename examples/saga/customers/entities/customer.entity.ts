import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Money } from '../../common';
import { CustomerCreditLimitExceeded } from '../replies';
import { CreditReservation } from './credit-reservation.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column(() => Money)
  creditLimit: Money;

  @OneToMany(
    () => CreditReservation,
    creditReservation => creditReservation.customer,
    {
      eager: true,
    },
  )
  creditReservations: CreditReservation[];

  availableCredit(): Money {
    const totalReserved: Money = this.creditReservations.reduce(
      (totalReserved, creditReservation) =>
        totalReserved.add(creditReservation.amount),
      Money.ZERO as Money,
    );

    return this.creditLimit.subtract(totalReserved);
  }

  reserveCredit(orderId: number, orderTotal: Money): void {
    if (this.availableCredit().isGreaterThanOrEqual(orderTotal)) {
      this.creditReservations.push(new CreditReservation(orderId, orderTotal));
    } else {
      throw new CustomerCreditLimitExceeded();
    }
  }
}
