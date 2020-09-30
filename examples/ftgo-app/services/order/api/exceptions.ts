import { RuntimeException } from '@nest-convoy/core';

export class InvalidMenuItemIdException extends RuntimeException {
  constructor(menuItemId: number) {
    super(`Invalid menu item id: ${menuItemId}`);
  }
}

export class RestaurantNotFoundException extends RuntimeException {
  constructor(restaurantId: number) {
    super(`Restaurant with ID ${restaurantId} not found`);
  }
}
