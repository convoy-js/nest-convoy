import { Money } from './money';

export class LineItemQuantityChange {
  currentOrderTotal: Money;
  newOrderTotal: Money;
  delta: Money;

  constructor(values: LineItemQuantityChange) {
    Object.assign(this, values);
  }
}
