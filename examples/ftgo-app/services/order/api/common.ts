import { LineItem, LineItemQuantityChange } from '@ftgo-app/libs/common';

import { DeliveryInfo, Order } from '../entities';

export class OrderRevision {
  constructor(
    readonly revisedOrderLineItems: RevisedOrderLineItem[],
    readonly deliveryInfo?: DeliveryInfo,
  ) {}
}

export class RevisedOrderLineItem extends LineItem {}

export class RevisedOrder {
  constructor(readonly order: Order, readonly change: LineItemQuantityChange) {}
}
