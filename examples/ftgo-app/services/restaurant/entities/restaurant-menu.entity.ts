import { Column, Entity, OneToMany } from 'typeorm';

import { MenuItem } from './menu-item.entity';

export class RestaurantMenu {
  @OneToMany(() => MenuItem, item => item.id)
  items: MenuItem[];

  constructor(values: RestaurantMenu) {
    Object.assign(this, values);
  }

  // constructor(readonly items: MenuItem[]) {}
}
