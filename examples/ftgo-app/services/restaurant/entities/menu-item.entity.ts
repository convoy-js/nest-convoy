import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm/index';

import { Money } from '@ftgo-app/libs/common';

import { RestaurantMenu } from './restaurant-menu.entity';

@Entity()
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @Column(() => Money)
  price: Money;

  @ManyToOne(() => RestaurantMenu, menu => menu.items)
  menu: RestaurantMenu[];

  constructor(values: MenuItem) {
    Object.assign(this, values);
  }
}
