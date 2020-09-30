import { Module } from '@nestjs/common';

import { KitchenServiceProxy } from './kitchen.service';
import { OrderServiceProxy } from './order.service';

@Module({
  providers: [KitchenServiceProxy, OrderServiceProxy],
})
export class ProxiesModule {}
