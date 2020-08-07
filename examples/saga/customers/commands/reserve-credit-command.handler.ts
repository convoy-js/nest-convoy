import { CommandMessage } from '@nest-convoy/commands';
import {
  CommandHandler,
  FromChannel,
  ICommandHandler,
} from '@nest-convoy/cqrs';

import { ReserveCreditCommand } from './reserve-credit.command';
import { Channel } from '../../common';
import { CustomerService } from '../services';
import {
  CustomerCreditReserved,
  CustomerCreditReservationFailed,
} from '../replies';

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
    } catch (e) {
      throw new CustomerCreditReservationFailed();
    }
  }
}
