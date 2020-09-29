import { TicketDetails } from './common';

export class TicketCancelled {}

export class TicketAccepted {
  constructor(readonly readyBy: Date) {}
}

export class TicketRevised {}

export class TicketPickedUp {}

export class TicketPreparationCompleted {}

export class TicketPreparationStarted {}

export class TicketCreated {
  constructor(readonly id: number, details: TicketDetails) {}
}
