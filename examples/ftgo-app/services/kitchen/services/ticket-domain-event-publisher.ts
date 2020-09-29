import {
  AggregateDomainEventPublisher,
  DomainEventPublisher,
} from '@nest-convoy/core';
import { Injectable } from '@nestjs/common';

import { Ticket } from '../entities';

@Injectable()
export class TicketDomainEventPublisher extends AggregateDomainEventPublisher<
  Ticket
> {
  constructor(domainEventPublisher: DomainEventPublisher) {
    super(domainEventPublisher, Ticket);
  }
}
