import {
  DomainEventEnvelope,
  DomainEventsConsumer,
  OnEvent,
} from '@nest-convoy/core';

import {
  RestaurantCreated,
  RestaurantMenuRevised,
  RestaurantServiceChannel,
} from '@ftgo-app/api/restaurant';

@DomainEventsConsumer(RestaurantServiceChannel.RESTAURANT_EVENT)
export class OrderEventsConsumer {
  @OnEvent(RestaurantCreated)
  async createMenu({
    aggregateId,
  }: DomainEventEnvelope<RestaurantCreated>): Promise<void> {}

  @OnEvent(RestaurantMenuRevised)
  async reviseMenu() {}
}
