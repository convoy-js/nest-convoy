import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/index';

import {
  RevisedOrderLineItem,
  TicketNotFoundException,
} from '@ftgo-app/libs/common';

import { Ticket } from '../entities';
import { TicketDetails } from '../api';
import { TicketDomainEventPublisher } from './ticket-domain-event-publisher';

@Injectable()
export class TicketService {
  constructor(
    private readonly domainEventPublisher: TicketDomainEventPublisher,
    @InjectRepository(Ticket)
    private readonly repository: Repository<Ticket>,
  ) {}

  private async findOrFail(id: Ticket['id']): Promise<Ticket> {
    const ticket = await this.repository.findOne(id);
    if (!ticket) {
      throw new TicketNotFoundException(id);
    }
    return ticket;
  }

  async create(
    restaurantId: number,
    orderId: number,
    { lineItems }: TicketDetails,
  ): Promise<Ticket> {
    const ticket = await this.repository.save({
      restaurantId,
      orderId,
      lineItems,
    });
    await this.domainEventPublisher.publish(ticket, []);

    return ticket;
  }

  async accept(ticketId: number, readyBy: Date): Promise<void> {
    const ticket = await this.findOrFail(ticketId);
    const events = ticket.accept(readyBy);
    await this.repository.save(ticket);
    await this.domainEventPublisher.publish(ticket, events);
  }

  async confirmCreate(id: Ticket['id']): Promise<void> {
    const ticket = await this.findOrFail(id);
    const events = ticket.confirmCreate();
    await this.repository.save(ticket);
    await this.domainEventPublisher.publish(ticket, events);
  }

  async cancelCreate(id: Ticket['id']): Promise<void> {
    const ticket = await this.findOrFail(id);
    const events = ticket.cancelCreate();
    await this.repository.save(ticket);
    await this.domainEventPublisher.publish(ticket, events);
  }

  async cancel(restaurantId: number, ticketId: Ticket['id']): Promise<void> {
    const ticket = await this.findOrFail(ticketId);
    // TODO: Verify restaurant id
    const events = ticket.cancel();
    await this.repository.save(ticket);
    await this.domainEventPublisher.publish(ticket, events);
  }

  async confirmCancel(
    restaurantId: number,
    ticketId: Ticket['id'],
  ): Promise<void> {
    const ticket = await this.findOrFail(ticketId);
    // TODO: Verify restaurant id
    const events = ticket.confirmCancel();
    await this.repository.save(ticket);
    await this.domainEventPublisher.publish(ticket, events);
  }

  async undoCancel(
    restaurantId: number,
    ticketId: Ticket['id'],
  ): Promise<void> {
    const ticket = await this.findOrFail(ticketId);
    // TODO: Verify restaurant id
    const events = ticket.undoCancel();
    await this.repository.save(ticket);
    await this.domainEventPublisher.publish(ticket, events);
  }

  async beginReviseOrder(
    restaurantId: number,
    ticketId: Ticket['id'],
    revisedOrderLineItems: RevisedOrderLineItem[],
  ): Promise<void> {
    const ticket = await this.findOrFail(ticketId);
    // TODO: Verify restaurant id
    const events = ticket.beginReviseOrder(revisedOrderLineItems);
    await this.repository.save(ticket);
    await this.domainEventPublisher.publish(ticket, events);
  }

  async undoBeginReviseOrder(
    restaurantId: number,
    ticketId: Ticket['id'],
  ): Promise<void> {
    const ticket = await this.findOrFail(ticketId);
    // TODO: Verify restaurant id
    const events = ticket.undoBeginReviseOrder();
    await this.repository.save(ticket);
    await this.domainEventPublisher.publish(ticket, events);
  }

  async confirmReviseTicket(
    restaurantId: number,
    ticketId: Ticket['id'],
    revisedOrderLineItems: RevisedOrderLineItem[],
  ): Promise<void> {
    const ticket = await this.findOrFail(ticketId);
    // TODO: Verify restaurant id
    const events = ticket.confirmReviseTicket(revisedOrderLineItems);
    await this.repository.save(ticket);
    await this.domainEventPublisher.publish(ticket, events);
  }
}
