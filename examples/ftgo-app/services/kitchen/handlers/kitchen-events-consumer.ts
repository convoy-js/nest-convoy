import {
  DomainEventEnvelope,
  DomainEventsConsumer,
  OnEvent,
} from '@nest-convoy/core';

import {
  RestaurantMenu,
  RestaurantCreated,
  Restaurant,
  RestaurantMenuRevised,
} from '@ftgo-app/api/restaurant';

import { KitchenService } from '../services';

@DomainEventsConsumer(() => Restaurant)
export class KitchenServiceEventsConsumer {
  constructor(private readonly kitchen: KitchenService) {}

  @OnEvent(RestaurantCreated)
  async createMenu({
    event,
    aggregateId,
  }: DomainEventEnvelope<RestaurantCreated>): Promise<void> {
    await this.kitchen.createMenu(aggregateId, event.menu);
  }

  @OnEvent(RestaurantMenuRevised)
  async reviseMenu({
    event,
    aggregateId,
  }: DomainEventEnvelope<RestaurantMenuRevised>): Promise<void> {
    await this.kitchen.reviseMenu(aggregateId, event.menu);
  }
}
