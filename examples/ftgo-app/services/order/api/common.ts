import { DeliveryInfo } from '../entities';

export class OrderRevision {
  deliveryInfo?: DeliveryInfo;
  revisedOrderLineItems: RevisedOrderLineItem[];
}

export class RevisedOrderLineItem {
  constructor(readonly quantity: number, readonly menuItemId: number) {}
}
