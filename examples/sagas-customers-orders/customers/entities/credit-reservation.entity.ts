import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Money } from '../../../sagas-customers-orders/common';

import { Customer } from './customer.entity';

@Entity()
export class CreditReservation {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  orderId: number;

  @Column(() => Money)
  amount: Money;

  @ManyToOne(() => Customer, customer => customer.creditReservations)
  customer: Customer;

  constructor(orderId: number, amount: Money) {
    this.orderId = orderId;
    this.amount = amount;
  }
}
