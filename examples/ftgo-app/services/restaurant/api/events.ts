import { Address } from '@ftgo-app/libs/common';

import { MenuItem, RestaurantMenu } from '../entities';

export class RestaurantCreated {
  constructor(
    readonly name: string,
    readonly address: Address,
    readonly menu: RestaurantMenu,
  ) {}
}

export class RestaurantMenuRevised {
  constructor(readonly menu: RestaurantMenu) {}
}
