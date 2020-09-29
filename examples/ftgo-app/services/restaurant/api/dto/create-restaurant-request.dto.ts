import { Address } from '@ftgo-app/libs/common';

import { RestaurantMenu } from '../../entities';

export class CreateRestaurantRequest {
  name: string;
  address: Address;
  menu: RestaurantMenu;
}
