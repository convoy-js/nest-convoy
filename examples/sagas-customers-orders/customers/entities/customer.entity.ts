import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinTable,
} from 'typeorm';

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
      cascade: true,
      eager: true,
    },
  )
  @JoinTable()
  creditReservations: CreditReservation[];

  availableCredit(): Money {
    const totalReserved = this.creditReservations.reduce(
      (totalReserved, creditReservation) =>
        totalReserved.add(creditReservation.amount),
      new Money(),
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
