import {
  CommandDestination,
  CommandMessage,
  CommandWithDestination,
  OnMessage,
  SagaCommandHandlers,
} from '@nest-convoy/core';

import { RestaurantServiceChannel } from '@ftgo-app/api/restaurant';

import { TicketService } from '../services';
import {
  BeginCancelTicketCommand,
  BeginReviseTicketCommand,
  CancelCreateTicketCommand,
  ConfirmCancelTicketCommand,
  ConfirmCreateTicketCommand,
  ConfirmReviseTicketCommand,
  CreateTicketCommand,
  CreateTicketReply,
  UndoBeginCancelTicketCommand,
  UndoBeginReviseTicketCommand,
} from '../api';

@SagaCommandHandlers('kitchen')
export class TicketHandlers {
  Q;
  constructor(private readonly ticket: TicketService) {}

  // @CommandDestination(RestaurantServiceChannel.COMMAND)
  @OnMessage(CreateTicketCommand, { withLock: true })
  async createTicket({
    command,
  }: CommandMessage<CreateTicketCommand>): Promise<CreateTicketReply> {
    const ticket = await this.ticket.create(
      command.restaurantId,
      command.orderId,
      command.ticketDetails,
    );

    return new CreateTicketReply(ticket.id);
  }

  @OnMessage(ConfirmCreateTicketCommand)
  async confirmCreateTicket({
    command: { ticketId },
  }: CommandMessage<ConfirmCreateTicketCommand>): Promise<void> {
    await this.ticket.confirmCreate(ticketId);
  }

  @OnMessage(CancelCreateTicketCommand)
  async cancelCreateTicket({
    command: { ticketId },
  }: CommandMessage<CancelCreateTicketCommand>): Promise<void> {
    await this.ticket.cancelCreate(ticketId);
  }

  @OnMessage(BeginCancelTicketCommand)
  async beginCancelTicket({
    command: { restaurantId, orderId },
  }: CommandMessage<BeginCancelTicketCommand>): Promise<void> {
    await this.ticket.cancel(restaurantId, orderId);
  }

  @OnMessage(ConfirmCancelTicketCommand)
  async confirmCancelTicket({
    command: { restaurantId, orderId },
  }: CommandMessage<ConfirmCancelTicketCommand>): Promise<void> {
    await this.ticket.confirmCancel(restaurantId, orderId);
  }

  @OnMessage(UndoBeginCancelTicketCommand)
  async undoBeginCancelTicket({
    command: { restaurantId, orderId },
  }: CommandMessage<UndoBeginCancelTicketCommand>): Promise<void> {
    await this.ticket.undoCancel(restaurantId, orderId);
  }

  @OnMessage(BeginReviseTicketCommand)
  async beginReviseTicket({
    command: { restaurantId, orderId, revisedOrderLineItems },
  }: CommandMessage<BeginReviseTicketCommand>): Promise<void> {
    await this.ticket.beginReviseOrder(
      restaurantId,
      orderId,
      revisedOrderLineItems,
    );
  }

  @OnMessage(UndoBeginReviseTicketCommand)
  async undoBeginReviseTicket({
    command: { restaurantId, orderId },
  }: CommandMessage<UndoBeginReviseTicketCommand>): Promise<void> {
    await this.ticket.undoBeginReviseOrder(restaurantId, orderId);
  }

  @OnMessage(ConfirmReviseTicketCommand)
  async confirmReviseTicket({
    command: { restaurantId, orderId, revisedOrderLineItems },
  }: CommandMessage<ConfirmReviseTicketCommand>): Promise<void> {
    await this.ticket.confirmReviseTicket(
      restaurantId,
      orderId,
      revisedOrderLineItems,
    );
  }
}
