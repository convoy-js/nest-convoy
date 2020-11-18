import {
  CommandMessage,
  OnMessage,
  SagaCommandHandlers,
} from '@nest-convoy/core';

import { Channel } from '../../common';
import { CustomerCreditReserved } from '../replies';
import { CustomerService } from '../customer.service';
import { ReserveCreditCommand } from './reserve-credit.command';

@SagaCommandHandlers(Channel.CUSTOMER)
export class ReserveCreditCommandHandler {
  constructor(private readonly customer: CustomerService) {}

  @OnMessage(ReserveCreditCommand)
  async reserveCredit({
    command: { customerId, orderId, orderTotal },
  }: CommandMessage<ReserveCreditCommand>): Promise<CustomerCreditReserved> {
    const { creditReservations } = await this.customer.reserveCredit(
      customerId,
      orderId,
      orderTotal,
    );

    return new CustomerCreditReserved(creditReservations);
  }
}
