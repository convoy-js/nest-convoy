import { Address, Money } from '@ftgo-app/libs/common';

import { Order } from '../entities';

export class OrderAuthorized {}

export class OrderCancelled {}

export class OrderCreated {
  constructor(
    readonly details: Order,
    readonly deliveryAddress: Address,
    readonly restaurantName: string,
  ) {}
}

export class BeginReviseOrderReply {
  constructor(readonly revisedOrderTotal: Money) {}
}

export class OrderAuthorizedCancelRequested {}
