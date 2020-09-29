import {
  CommandMessage,
  ICommandHandler,
  SagaCommandHandler,
} from '@nest-convoy/core';

import { Channel } from '../../common';
import { CustomerCreditReserved } from '../replies';
import { CustomerService } from '../customer.service';
import { ReserveCreditCommand } from './reserve-credit.command';

@SagaCommandHandler(ReserveCreditCommand, Channel.CUSTOMER)
export class ReserveCreditCommandHandler
  implements ICommandHandler<ReserveCreditCommand> {
  constructor(private readonly customer: CustomerService) {}

  async execute({
    command,
  }: CommandMessage<ReserveCreditCommand>): Promise<CustomerCreditReserved> {
    await this.customer.reserveCredit(
      command.customerId,
      command.orderId,
      command.orderTotal,
    );

    return new CustomerCreditReserved();
  }
}
