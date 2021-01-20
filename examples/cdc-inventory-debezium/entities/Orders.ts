import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Products } from './Products';
import { Customers } from './Customers';

@Index('orders_pkey', ['id'], { unique: true })
@Entity('orders', { schema: 'inventory' })
export class Orders {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('date', { name: 'order_date' })
  orderDate: string;

  @Column('integer', { name: 'quantity' })
  quantity: number;

  @ManyToOne(() => Products, products => products.orders)
  @JoinColumn([{ name: 'product_id', referencedColumnName: 'id' }])
  product: Products;

  @ManyToOne(() => Customers, customers => customers.orders)
  @JoinColumn([{ name: 'purchaser', referencedColumnName: 'id' }])
  purchaser: Customers;
}
