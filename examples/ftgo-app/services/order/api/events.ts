import { Address, Money } from '@ftgo-app/libs/common';

import { OrderDetails } from '../entities';
import { OrderRevision } from './common';

export class OrderAuthorized {}

export class OrderCancelled {}

export class OrderCreated {
  constructor(
    readonly orderDetails: OrderDetails,
    readonly deliveryAddress: Address,
    readonly restaurantName: string,
  ) {}
}

export class BeginReviseOrderReply {
  constructor(readonly revisedOrderTotal: Money) {}
}

export class OrderRejected {}

export class OrderRevisionProposed {
  constructor(
    readonly revision: OrderRevision,
    readonly currentOrderTotal: Money,
    readonly newOrderTotal: Money,
  ) {}
}

export class OrderRevised extends OrderRevisionProposed {}

export class OrderAuthorizedCancelRequested {}
