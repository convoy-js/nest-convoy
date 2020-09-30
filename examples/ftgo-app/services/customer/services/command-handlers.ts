import {
  CommandMessage,
  OnMessage,
  SagaCommandHandlers,
} from '@nest-convoy/core';

import { CustomerServiceChannel, ValidateOrderByCustomerCommand } from '../api';
import { CustomerService } from './customer.service';

@SagaCommandHandlers(CustomerServiceChannel.COMMAND)
export class CustomerCommandHandlers {
  constructor(private readonly customer: CustomerService) {}

  @OnMessage(ValidateOrderByCustomerCommand)
  async validateOrderByConsumer({
    command: { customerId, orderTotal },
  }: CommandMessage<ValidateOrderByCustomerCommand>): Promise<void> {
    await this.customer.validateOrder(customerId, orderTotal);
  }
}
