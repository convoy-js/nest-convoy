import { Module } from '@nestjs/common';

import { OrderProxiesModule } from '../proxies';
import { CreateOrderSaga } from './create-order/create-order.saga';
import { CancelOrderSaga } from './cancel-order/cancel-order.saga';

@Module({
  imports: [OrderProxiesModule],
  providers: [CreateOrderSaga, CancelOrderSaga],
})
export class OrderSagasModule {}
