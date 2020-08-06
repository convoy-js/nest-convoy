import { Money } from '../common';

export class ReserveCreditCommand {
  constructor(
    readonly customerId: string,
    readonly orderId: string,
    readonly orderTotal: Money,
  ) {}
}
