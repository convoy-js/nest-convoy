import { Money } from '../../common';

export class ReserveCreditCommand {
  constructor(
    readonly customerId: number,
    readonly orderId: number,
    readonly orderTotal: Money,
  ) {}
}
