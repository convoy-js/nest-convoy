import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { f, t } from '@deepkit/type';

import { Money } from '../../common';
import { Customer } from './customer.entity';

@Entity()
export class CreditReservation {
  @PrimaryGeneratedColumn()
  @f
  id: number;

  @PrimaryColumn()
  @f
  orderId: number;

  @Column(() => Money)
  @t
  amount: Money;

  @ManyToOne(() => Customer, customer => customer.creditReservations)
  @t
  customer: Customer;

  constructor(orderId: number, amount: Money) {
    this.orderId = orderId;
    this.amount = amount;
  }
}
