import {
  Column,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { f, t } from '@deepkit/type';

import { AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Money, Namespace } from '../../common';
import { Customer } from './customer.entity';

@Entity()
@AvroSchema(Namespace.CUSTOMER)
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
  @f.type(() => Customer)
  customer: Customer;

  constructor(orderId: number, amount: Money) {
    this.orderId = orderId;
    this.amount = amount;
  }
}
