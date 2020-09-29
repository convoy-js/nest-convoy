import { MenuItem } from './menu-item.entity';

export class RestaurantMenu {
  constructor(readonly items: MenuItem[]) {}
}
