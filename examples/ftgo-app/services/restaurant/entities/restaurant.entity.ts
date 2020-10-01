import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';
import { AggregateRoot } from '@nest-convoy/core';

import { Address } from '@ftgo-app/libs/common';

import { MenuItem } from './menu-item.entity';
import { RestaurantMenu } from './restaurant-menu.entity';

// @Entity()
// export class Restaurant implements AggregateRoot {
//   constructor(readonly id: number, readonly menuItems: MenuItem[]) {}
// }

@Entity()
export class Restaurant implements AggregateRoot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column(() => RestaurantMenu)
  menu: RestaurantMenu;

  @Column(() => Address)
  address: Address;

  constructor(values: Restaurant) {
    Object.assign(this, values);
  }

  // constructor(name: string, address: Address, menu: RestaurantMenu) {
  //   this.name = name;
  //   this.address = address;
  //   this.menu = menu;
  // }
}
