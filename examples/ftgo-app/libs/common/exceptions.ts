import { AggregateException, RuntimeException } from '@nest-convoy/core';

export class UnsupportedStateTransitionException extends AggregateException {
  constructor(state: string) {
    super(`current state: ${state}`);
  }
}

export class TicketNotFoundException extends RuntimeException {
  constructor(ticketId: number) {
    super('Ticket not found: ' + ticketId);
  }
}
