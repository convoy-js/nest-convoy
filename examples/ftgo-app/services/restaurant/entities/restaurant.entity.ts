import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from '@ftgo-app/libs/common';

import { AggregateRoot } from '@nest-convoy/core';

import { RestaurantMenu } from './restaurant-menu.entity';

@Entity()
export class Restaurant extends AggregateRoot<Restaurant> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column(() => RestaurantMenu)
  menu: RestaurantMenu;

  @Column(() => Address)
  address: Address;
}
