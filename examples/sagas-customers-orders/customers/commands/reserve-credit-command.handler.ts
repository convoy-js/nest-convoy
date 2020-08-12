import {
  CommandMessage,
  CommandHandler,
  FromChannel,
  ICommandHandler,
} from '@nest-convoy/core';

import { Channel } from '../../common';
import { CustomerService } from '../services';
import { CustomerCreditReserved } from '../replies';

import { ReserveCreditCommand } from './reserve-credit.command';

@CommandHandler(ReserveCreditCommand)
@FromChannel(Channel.CUSTOMER_SERVICE)
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
