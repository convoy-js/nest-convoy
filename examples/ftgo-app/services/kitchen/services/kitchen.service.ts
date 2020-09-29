import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/index';

import { Restaurant, RestaurantMenu } from '@ftgo-app/api/restaurant';

@Injectable()
export class KitchenService {
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  createMenu(id: number, menu: RestaurantMenu): Promise<Restaurant> {
    return this.restaurantRepository.save(new Restaurant(id, menu.items));
  }

  async reviseMenu(id: number, menu: RestaurantMenu): Promise<void> {}
}
