import { Entity, ManyToOne } from 'typeorm';
import { LineItem } from '@ftgo-app/libs/common';

import { Ticket } from './ticket.entity';

@Entity()
export class TicketLineItem extends LineItem {
  @ManyToOne(() => Ticket, ticket => ticket.lineItems)
  ticket: Ticket;
}
