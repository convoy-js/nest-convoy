import {
  RestaurantCreated,
  RestaurantMenuRevised,
  RestaurantServiceChannel,
} from '@ftgo-app/api/restaurant';

import {
  DomainEventEnvelope,
  DomainEventHandlers,
  OnEvent,
} from '@nest-convoy/core';

@DomainEventHandlers(RestaurantServiceChannel.RESTAURANT_EVENT)
export class RestaurantEventsConsumer {
  @OnEvent(RestaurantCreated)
  async createMenu({
    aggregateId,
  }: DomainEventEnvelope<RestaurantCreated>): Promise<void> {}

  @OnEvent(RestaurantMenuRevised)
  async reviseMenu() {}
}
