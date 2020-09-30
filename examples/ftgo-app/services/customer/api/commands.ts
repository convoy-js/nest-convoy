import { Money } from '@ftgo-app/libs/common';

export class ValidateOrderByCustomerCommand {
  constructor(
    readonly customerId: number,
    readonly orderId: number,
    readonly orderTotal: Money,
  ) {}
}
