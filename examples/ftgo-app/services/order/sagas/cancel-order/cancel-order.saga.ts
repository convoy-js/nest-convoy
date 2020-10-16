import { CommandDestination, NestSaga, Saga } from '@nest-convoy/core';

import {
  AccountingServiceChannel,
  ReverseAuthorizationCommand,
} from '@ftgo-app/api/accounting';
import {
  BeginCancelTicketCommand,
  ConfirmCancelTicketCommand,
  KitchenServiceChannel,
  UndoBeginCancelTicketCommand,
} from '@ftgo-app/api/kitchen';

import {
  BeginCancelOrderCommand,
  ConfirmCancelOrderCommand,
  OrderServiceChannel,
  UndoBeginCancelOrderCommand,
} from '../../api';

import { CancelOrderSagaData } from './cancel-order-saga.data';

@Saga(CancelOrderSagaData)
export class CancelOrderSaga extends NestSaga<CancelOrderSagaData> {
  readonly sagaDefinition = this.step()
    .invokeParticipant(this.beginCancel)
    .withCompensation(this.undoBeginCancel)
    .step()
    .invokeParticipant(this.beginCancelTicket)
    .withCompensation(this.undoBeginCancelTicket)
    .step()
    .invokeParticipant(this.reverseAuthorization)
    .step()
    .invokeParticipant(this.confirmTicketCancel)
    .step()
    .invokeParticipant(this.confirmOrderCancel)
    .build();

  @CommandDestination(OrderServiceChannel.COMMAND)
  private beginCancel({
    orderId,
  }: CancelOrderSagaData): BeginCancelOrderCommand {
    return new BeginCancelOrderCommand(orderId);
  }

  @CommandDestination(OrderServiceChannel.COMMAND)
  private undoBeginCancel({
    orderId,
  }: CancelOrderSagaData): UndoBeginCancelOrderCommand {
    return new UndoBeginCancelOrderCommand(orderId);
  }

  @CommandDestination(KitchenServiceChannel.COMMAND)
  private beginCancelTicket({
    orderId,
    orderDetails: { restaurantId },
  }: CancelOrderSagaData): BeginCancelTicketCommand {
    return new BeginCancelTicketCommand(restaurantId, orderId);
  }

  @CommandDestination(KitchenServiceChannel.COMMAND)
  private undoBeginCancelTicket({
    orderDetails: { restaurantId },
    orderId,
  }: CancelOrderSagaData): UndoBeginCancelTicketCommand {
    return new UndoBeginCancelTicketCommand(restaurantId, orderId);
  }

  @CommandDestination(AccountingServiceChannel.COMMAND)
  private reverseAuthorization({
    orderDetails: { customerId, total },
    orderId,
  }: CancelOrderSagaData): ReverseAuthorizationCommand {
    return new ReverseAuthorizationCommand(customerId, orderId, total);
  }

  @CommandDestination(KitchenServiceChannel.COMMAND)
  private confirmTicketCancel({
    orderDetails: { restaurantId },
    orderId,
  }: CancelOrderSagaData): ConfirmCancelTicketCommand {
    return new ConfirmCancelTicketCommand(restaurantId, orderId);
  }

  @CommandDestination(OrderServiceChannel.COMMAND)
  private confirmOrderCancel({
    orderId,
  }: CancelOrderSagaData): ConfirmCancelOrderCommand {
    return new ConfirmCancelOrderCommand(orderId);
  }
}
