export class TicketLineItem {
  constructor(
    readonly menuItemId: string,
    readonly name: string,
    readonly quantity: number,
  ) {}
}
