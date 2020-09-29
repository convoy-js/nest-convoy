import {
  CommandMessage,
  OnMessage,
  SagaCommandHandlers,
} from '@nest-convoy/core';

import { CreateTicketCommand, CreateTicketReply } from '../api';
import { TicketService } from '../services';

@SagaCommandHandlers('kitchen')
export class TicketHandlers {
  constructor(private readonly ticket: TicketService) {}

  @OnMessage(CreateTicketCommand, { withLock: true })
  async createTicket({
    command,
  }: CommandMessage<CreateTicketCommand>): Promise<CreateTicketReply> {
    const ticket = await this.ticket.create(
      command.restaurantId,
      command.restaurantId,
      command.ticketDetails,
    );

    // return withLock(ticket).withSuccess(reply);
    return new CreateTicketReply(ticket.id);
  }
}
