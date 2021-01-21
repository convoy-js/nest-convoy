import {
  OrderAuthorized,
  OrderCancelled,
  OrderCreated,
  OrderRejected,
  OrderServiceChannel,
} from '@ftgo-app/api/order';

import {
  DomainEventEnvelope,
  DomainEventHandlers,
  OnEvent,
} from '@nest-convoy/core';

@DomainEventHandlers(OrderServiceChannel.ORDER_EVENT)
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
