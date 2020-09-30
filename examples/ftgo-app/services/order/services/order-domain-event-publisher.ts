import { Injectable } from '@nestjs/common';
import { AggregateDomainEventPublisher } from '@nest-convoy/core';

import { Order } from '../entities';

@Injectable()
export class OrderDomainEventPublisher extends AggregateDomainEventPublisher(
  Order,
) {}
