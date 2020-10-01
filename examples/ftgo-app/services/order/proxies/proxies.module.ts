import { Module } from '@nestjs/common';

import { KitchenServiceProxy } from './kitchen.service';
import { OrderServiceProxy } from './order.service';
import { AccountingServiceProxy } from './accounting.service';
import { CustomerServiceProxy } from './customer.service';

const proxies = [
  KitchenServiceProxy,
  OrderServiceProxy,
  AccountingServiceProxy,
  CustomerServiceProxy,
];

@Module({
  providers: proxies,
  exports: proxies,
})
export class OrderProxiesModule {}
