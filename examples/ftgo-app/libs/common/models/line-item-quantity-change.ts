import { Money } from '@ftgo-app/libs/common';

export class LineItemQuantityChange {
  currentOrderTotal: Money;
  newOrderTotal: Money;
  delta: Money;

  constructor(values: LineItemQuantityChange) {
    Object.assign(this, values);
  }
}
