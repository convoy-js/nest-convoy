import { Module } from '@nestjs/common';
import { ConvoyCommonModule } from '@nest-convoy/core';

import { RestaurantEntitiesModule } from '../entities';
import { RestaurantService } from './restaurant.service';
import { RestaurantDomainEventPublisher } from './domain-event-publisher';

@Module({
  imports: [ConvoyCommonModule, RestaurantEntitiesModule],
  providers: [RestaurantService, RestaurantDomainEventPublisher],
})
export class RestaurantServicesModule {}
