import {
  CommandMessage,
  CommandHandler,
  FromChannel,
  ICommandHandler,
} from '@nest-convoy/core';

import { Channel } from '../../common';
import { CustomerService } from '../services';
import {
  CustomerCreditReserved,
  CustomerCreditReservationFailed,
} from '../replies';

import { ReserveCreditCommand } from './reserve-credit.command';

@CommandHandler(ReserveCreditCommand)
@FromChannel(Channel.CUSTOMER_SERVICE)
export class ReserveCreditCommandHandler
  implements ICommandHandler<ReserveCreditCommand> {
  constructor(private readonly customer: CustomerService) {}
  async execute({
    command,
  }: CommandMessage<ReserveCreditCommand>): Promise<CustomerCreditReserved> {
    const customer = await this.customer.find(command.customerId);

    try {
      await this.customer.reserveCredit(customer, command);

      return new CustomerCreditReserved();
    } catch (err) {
      throw new CustomerCreditReservationFailed(err.message);
    }
  }
}
