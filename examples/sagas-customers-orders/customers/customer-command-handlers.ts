import {
  CommandMessage,
  OnMessage,
  SagaCommandHandlers,
} from '@nest-convoy/core';

import { Channel } from '../common';
import { CustomerCreditReserved, ReserveCreditCommand } from './api';
import { CustomerService } from './customer.service';

@SagaCommandHandlers(Channel.CUSTOMER)
export class CustomerCommandHandlers {
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

    return new CustomerCreditReserved(creditReservations.getItems());
  }
}
