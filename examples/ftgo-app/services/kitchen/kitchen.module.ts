import { Module } from '@nestjs/common';

import {
  TicketService,
  KitchenService,
  TicketDomainEventPublisher,
} from './services';

@Module({
  providers: [KitchenService, TicketService, TicketDomainEventPublisher],
})
export class KitchenModule {}
