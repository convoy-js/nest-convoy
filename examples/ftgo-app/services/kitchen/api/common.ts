import { TicketLineItem } from '../entities';

export class TicketDetails {
  constructor(readonly lineItems: TicketLineItem[]) {}
}
