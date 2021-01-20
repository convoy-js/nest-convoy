import {
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Orders } from './Orders';
import { ProductsOnHand } from './ProductsOnHand';

@Index('products_pkey', ['id'], { unique: true })
@Entity('products', { schema: 'inventory' })
export class Products {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id' })
  id: number;

  @Column('character varying', { name: 'name', length: 255 })
  name: string;

  @Column('character varying', {
    name: 'description',
    nullable: true,
    length: 512,
  })
  description: string | null;

  @Column('double precision', { name: 'weight', nullable: true, precision: 53 })
  weight: number | null;

  @OneToMany(() => Orders, orders => orders.product)
  orders: Orders[];

  @OneToOne(() => ProductsOnHand, productsOnHand => productsOnHand.product)
  productsOnHand: ProductsOnHand;
}
