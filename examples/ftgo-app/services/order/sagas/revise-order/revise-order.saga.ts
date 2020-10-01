import { CommandDestination, NestSaga, Saga } from '@nest-convoy/core';

import {
  AccountingServiceChannel,
  ReverseAuthorizationCommand,
} from '@ftgo-app/api/accounting';
import {
  BeginReviseTicketCommand,
  ConfirmReviseTicketCommand,
  KitchenServiceChannel,
  UndoBeginReviseTicketCommand,
} from '@ftgo-app/api/kitchen';

import {
  BeginReviseOrderCommand,
  BeginReviseOrderReply,
  ConfirmReviseOrderCommand,
  OrderServiceChannel,
  UndoBeginReviseOrderCommand,
} from '../../api';

import { ReviseOrderSagaData } from './revise-order-saga.data';

@Saga(ReviseOrderSagaData)
export class ReviseOrderSaga extends NestSaga<ReviseOrderSagaData> {
  readonly sagaDefinition = this.step()
    .invokeParticipant(this.beginReviseOrder)
    .onReply(BeginReviseOrderReply, this.handleBeginReviseOrderReply)
    .withCompensation(this.undoBeginReviseOrder)
    .step()
    .invokeParticipant(this.beginReviseTicket)
    .withCompensation(this.undoBeginReviseTicket)
    .step()
    .invokeParticipant(this.reviseAuthorization)
    .step()
    .invokeParticipant(this.confirmTicketRevision)
    .step()
    .invokeParticipant(this.confirmOrderRevision)
    .build();

  @CommandDestination(OrderServiceChannel.COMMAND)
  private beginReviseOrder({
    orderId,
    orderRevision,
  }: ReviseOrderSagaData): BeginReviseOrderCommand {
    return new BeginReviseOrderCommand(orderId, orderRevision);
  }

  private handleBeginReviseOrderReply(
    data: ReviseOrderSagaData,
    reply: BeginReviseOrderReply,
  ): void {
    data.revisedOrderTotal = reply.revisedOrderTotal;
  }

  @CommandDestination(OrderServiceChannel.COMMAND)
  private undoBeginReviseOrder({
    orderId,
  }: ReviseOrderSagaData): UndoBeginReviseOrderCommand {
    return new UndoBeginReviseOrderCommand(orderId);
  }

  @CommandDestination(KitchenServiceChannel.COMMAND)
  private beginReviseTicket({
    orderId,
    restaurantId,
    orderRevision,
  }: ReviseOrderSagaData): BeginReviseTicketCommand {
    return new BeginReviseTicketCommand(restaurantId, orderId, orderRevision);
  }

  @CommandDestination(KitchenServiceChannel.COMMAND)
  private undoBeginReviseTicket({
    orderId,
    restaurantId,
  }: ReviseOrderSagaData): UndoBeginReviseTicketCommand {
    return new UndoBeginReviseTicketCommand(restaurantId, orderId);
  }

  @CommandDestination(AccountingServiceChannel.COMMAND)
  private reviseAuthorization({
    orderId,
    customerId,
    revisedOrderTotal,
  }: ReviseOrderSagaData): ReverseAuthorizationCommand {
    return new ReverseAuthorizationCommand(
      customerId,
      orderId,
      revisedOrderTotal,
    );
  }

  @CommandDestination(KitchenServiceChannel.COMMAND)
  private confirmTicketRevision({
    orderId,
    restaurantId,
    orderRevision,
  }: ReviseOrderSagaData): ConfirmReviseTicketCommand {
    return new ConfirmReviseTicketCommand(restaurantId, orderId, orderRevision);
  }

  @CommandDestination(OrderServiceChannel.COMMAND)
  private confirmOrderRevision({
    orderId,
    orderRevision,
  }: ReviseOrderSagaData): ConfirmReviseOrderCommand {
    return new ConfirmReviseOrderCommand(orderId, orderRevision);
  }
}
