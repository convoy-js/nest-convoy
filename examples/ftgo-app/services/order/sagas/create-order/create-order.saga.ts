import { NestSaga, Saga } from '@nest-convoy/core';

import { AuthorizeCommand } from '@ftgo-app/api/accounting';
import { ValidateOrderByCustomerCommand } from '@ftgo-app/api/customer';
import {
  CancelCreateTicketCommand,
  ConfirmCreateTicketCommand,
  CreateTicketCommand,
  CreateTicketReply,
  TicketDetails,
} from '@ftgo-app/api/kitchen';

import { ApproveOrderCommand, RejectOrderCommand } from '../../api';
import {
  AccountingServiceProxy,
  CustomerServiceProxy,
  KitchenServiceProxy,
  OrderServiceProxy,
} from '../../proxies';

import { CreateOrderSagaData } from './create-order-saga.data';

@Saga(CreateOrderSagaData)
export class CreateOrderSaga extends NestSaga<CreateOrderSagaData> {
  readonly sagaDefinition = this.step()
    .withCompensation(this.order.reject, this.rejectOrder)
    .step()
    .invokeParticipant(this.customer.validateOrder, this.validateOrder)
    .step()
    .invokeParticipant(this.kitchen.create, this.createTicket)
    .onReply(CreateTicketReply, this.handleCreateTicketReply)
    .withCompensation(this.kitchen.cancel, this.cancelCreateTicket)
    .step()
    .invokeParticipant(this.accounting.authorize, this.authorize)
    .step()
    .invokeParticipant(this.kitchen.confirmCreate, this.confirmCreateTicket)
    .step()
    // @ts-ignore
    .invokeParticipant(this.order.approve, this.approveOrder)
    .build();

  constructor(
    private readonly kitchen: KitchenServiceProxy,
    private readonly accounting: AccountingServiceProxy,
    private readonly order: OrderServiceProxy,
    private readonly customer: CustomerServiceProxy,
  ) {
    super();
  }

  private approveOrder({ orderId }: CreateOrderSagaData): ApproveOrderCommand {
    return new ApproveOrderCommand(orderId);
  }

  private authorize({
    orderDetails: { customerId, total },
    orderId,
  }: CreateOrderSagaData): AuthorizeCommand {
    return new AuthorizeCommand(customerId, orderId, total);
  }

  private confirmCreateTicket({
    ticketId,
  }: CreateOrderSagaData): ConfirmCreateTicketCommand {
    return new ConfirmCreateTicketCommand(ticketId);
  }

  private rejectOrder({ orderId }: CreateOrderSagaData): RejectOrderCommand {
    return new RejectOrderCommand(orderId);
  }

  private validateOrder({
    orderDetails: { customerId, total },
    orderId,
  }: CreateOrderSagaData): ValidateOrderByCustomerCommand {
    return new ValidateOrderByCustomerCommand(customerId, orderId, total);
  }

  private handleCreateTicketReply(
    data: CreateOrderSagaData,
    reply: CreateTicketReply,
  ): void {
    data.ticketId = reply.ticketId;
  }

  private cancelCreateTicket(
    data: CreateOrderSagaData,
  ): CancelCreateTicketCommand {
    return new CancelCreateTicketCommand(data.ticketId);
  }

  // @CommandDestination(RestaurantServiceChannel.COMMAND)
  private createTicket({
    orderDetails: { restaurantId, lineItems },
    orderId,
  }: CreateOrderSagaData): CreateTicketCommand {
    // TODO: Refactor this when @CommandDestination is implemented
    return new CreateTicketCommand(
      restaurantId,
      orderId,
      new TicketDetails(lineItems),
    );
  }
}
