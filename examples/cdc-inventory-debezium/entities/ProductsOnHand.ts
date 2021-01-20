import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';

import { Products } from './Products';

@Index('products_on_hand_pkey', ['productId'], { unique: true })
@Entity('products_on_hand', { schema: 'inventory' })
export class ProductsOnHand {
  @Column('integer', { primary: true, name: 'product_id' })
  productId: number;

  @Column('integer', { name: 'quantity' })
  quantity: number;

  @OneToOne(() => Products, products => products.productsOnHand)
  @JoinColumn([{ name: 'product_id', referencedColumnName: 'id' }])
  product: Products;
}
