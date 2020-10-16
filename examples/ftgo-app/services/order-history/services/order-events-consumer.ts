import {
  DomainEventEnvelope,
  DomainEventsConsumer,
  OnEvent,
} from '@nest-convoy/core';

import {
  OrderAuthorized,
  OrderCancelled,
  OrderCreated,
  OrderRejected,
  OrderServiceChannel,
} from '@ftgo-app/api/order';

@DomainEventsConsumer(OrderServiceChannel.ORDER_EVENT)
export class OrderEventsConsumer {
  @OnEvent(OrderCreated)
  created({ event }: DomainEventEnvelope<OrderCreated>) {}

  @OnEvent(OrderAuthorized)
  authorized({ event }: DomainEventEnvelope<OrderAuthorized>) {}

  @OnEvent(OrderCancelled)
  cancelled({ event }: DomainEventEnvelope<OrderCancelled>) {}

  @OnEvent(OrderRejected)
  rejected({ event }: DomainEventEnvelope<OrderRejected>) {}
}
