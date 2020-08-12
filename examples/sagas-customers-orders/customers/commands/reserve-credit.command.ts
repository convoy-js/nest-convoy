import { Money } from '../../../sagas-customers-orders/common';

export class ReserveCreditCommand {
  constructor(
    readonly customerId: number,
    readonly orderId: number,
    readonly orderTotal: Money,
  ) {}
}
