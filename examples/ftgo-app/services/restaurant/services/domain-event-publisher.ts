import { Injectable } from '@nestjs/common';

import { AggregateDomainEventPublisher } from '@nest-convoy/core';

import { Restaurant } from '../entities';

@Injectable()
export class RestaurantDomainEventPublisher extends AggregateDomainEventPublisher(
  Restaurant,
) {}
