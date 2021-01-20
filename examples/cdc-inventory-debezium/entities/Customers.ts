import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Orders } from './Orders';

@Index('customers_email_key', ['email'], { unique: true })
@Index('customers_pkey', ['id'], { unique: true })
@Entity('customers', { schema: 'inventory' })
export class Customers {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'first_name', length: 255 })
  firstName: string;

  @Column('character varying', { name: 'last_name', length: 255 })
  lastName: string;

  @Column('character varying', { name: 'email', unique: true, length: 255 })
  email: string;

  @OneToMany(() => Orders, orders => orders.purchaser)
  orders: Orders[];
}
