import { AggregateDomainEventPublisher } from '@nest-convoy/core';
import { Injectable } from '@nestjs/common';

import { RestaurantServiceChannel } from '../api';

@Injectable()
export class RestaurantDomainEventPublisher extends AggregateDomainEventPublisher(
  RestaurantServiceChannel.RESTAURANT_EVENT,
) {}
