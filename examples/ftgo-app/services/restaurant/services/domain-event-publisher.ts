import { Injectable } from '@nestjs/common';

import { AggregateDomainEventPublisher } from '@nest-convoy/core';

import { RestaurantServiceChannel } from '../api';
import { Restaurant } from '../entities';

@Injectable()
export class RestaurantDomainEventPublisher extends AggregateDomainEventPublisher<Restaurant>(
  RestaurantServiceChannel.RESTAURANT_EVENT,
) {}
