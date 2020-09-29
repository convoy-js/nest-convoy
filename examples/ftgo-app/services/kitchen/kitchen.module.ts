import { Module } from '@nestjs/common';

import { TicketService, KitchenService } from './services';

@Module({
  providers: [KitchenService, TicketService],
})
export class KitchenModule {}
