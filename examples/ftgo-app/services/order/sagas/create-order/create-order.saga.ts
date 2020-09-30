import { CommandWithDestination, NestSaga, Saga } from '@nest-convoy/core';

import { ValidateOrderByCustomerCommand } from '@ftgo-app/api/customer';
import { RestaurantServiceChannel } from '@ftgo-app/api/restaurant';
import { CreateTicketCommand, TicketDetails } from '@ftgo-app/api/kitchen';

import { RejectOrderCommand } from '../../api';
import {
  CustomerServiceProxy,
  KitchenServiceProxy,
  OrderServiceProxy,
} from '../../proxies';

import { CreateOrderSagaData } from './create-order-saga.data';

@Saga(CreateOrderSagaData)
export class CreateOrderSaga extends NestSaga<CreateOrderSagaData> {
  constructor(
    private readonly kitchen: KitchenServiceProxy,
    private readonly order: OrderServiceProxy,
    private readonly customer: CustomerServiceProxy,
  ) {
    super();
  }

  readonly sagaDefinition = this.step()
    .withCompensation(this.order.reject, this.createRejectOrderCommand)
    .step()
    .invokeParticipant(
      this.customer.validateOrder,
      this.createValidateOrderByCustomerCommand,
    )
    .step()
    .invokeParticipant(this.kitchen.create, this.createCreateTicketCommand)
    .build();

  private createRejectOrderCommand(
    data: CreateOrderSagaData,
  ): RejectOrderCommand {
    return new RejectOrderCommand(data.orderId);
  }

  private createValidateOrderByCustomerCommand({
    orderDetails: { customerId, orderTotal },
    orderId,
  }: CreateOrderSagaData): ValidateOrderByCustomerCommand {
    return new ValidateOrderByCustomerCommand(customerId, orderId, orderTotal);
  }

  private handleCreateTicketReply(data: CreateOrderSagaData) {}

  private createCreateTicketCommand({
    orderDetails,
    orderId,
  }: CreateOrderSagaData): CommandWithDestination<CreateTicketCommand> {
    return new CommandWithDestination(
      RestaurantServiceChannel.COMMAND,
      new CreateTicketCommand(orderDetails.restaurantId, orderId, new TicketDetails(orderDetails.)),
    );
  }
}
