import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  JoinTable,
} from 'typeorm';
import { f, t } from '@deepkit/type';

import { Money } from '../../common';
import { CustomerCreditLimitExceeded } from '../api';
import { CreditReservation } from './credit-reservation.entity';

@Entity()
export class Customer {
  @PrimaryGeneratedColumn()
  @f
  id: number;

  @Column()
  @f
  name: string;

  @Column(() => Money)
  @t
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
  @t.array(CreditReservation)
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
