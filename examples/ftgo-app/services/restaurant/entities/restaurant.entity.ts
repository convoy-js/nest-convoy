import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { AggregateRoot } from '@nest-convoy/core';

import { Address } from '@ftgo-app/libs/common';

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

  applyEvent<E>(event: E): this {
    return this;
  }
}
