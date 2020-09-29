import { AggregateDomainEventPublisher } from '@nest-convoy/core';
import { Injectable } from '@nestjs/common';

import { KitchenServiceChannel } from '../api';

@Injectable()
export class TicketDomainEventPublisher extends AggregateDomainEventPublisher(
  KitchenServiceChannel.TICKET_EVENT,
) {}
