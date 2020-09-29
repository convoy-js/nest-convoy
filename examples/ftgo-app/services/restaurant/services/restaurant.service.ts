import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/index';

import { CreateRestaurantRequest, RestaurantCreated } from '../api';
import { Restaurant } from '../entities';
import { RestaurantDomainEventPublisher } from './restaurant-domain-event-publisher';

@Injectable()
export class RestaurantService {
  constructor(
    private readonly domainEventPublisher: RestaurantDomainEventPublisher,
    @InjectRepository(Restaurant)
    private readonly repository: Repository<Restaurant>,
  ) {}

  async create({
    name,
    address,
    menu,
  }: CreateRestaurantRequest): Promise<Restaurant> {
    const restaurant = await this.repository.save({
      name,
      address,
      menu,
    });
    await this.domainEventPublisher.publish(restaurant, [
      new RestaurantCreated(name, address, menu),
    ]);

    return restaurant;
  }
}
