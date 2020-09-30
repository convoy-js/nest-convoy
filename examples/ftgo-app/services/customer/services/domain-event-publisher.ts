import { Injectable } from '@nestjs/common';
import { AggregateDomainEventPublisher } from '@nest-convoy/core';

import { Customer } from '../entities';

@Injectable()
export class CustomerDomainEventPublisher extends AggregateDomainEventPublisher(
  Customer,
) {}
