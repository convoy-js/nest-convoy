import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';
import { ConvoyKafkaCdcOutboxBrokerModule } from '@nest-convoy/messaging/broker/kafka';

import { Channel, defaultOptions } from '../common';
import { Order } from './entities';
import { OrdersController } from './orders.controller';
import { OrderService } from './order.service';
import { CreateOrderSaga } from './sagas/create-order';
import { CustomerServiceProxy } from './sagas/participants';

@Module({
  imports: [
    ConvoyCommonModule,
    // TypeOrmModule.forRoot({
    //   ...defaultOptions,
    //   schema: 'orders',
    //   entities: [Order],
    // } as TypeOrmModuleOptions),
    ConvoyKafkaCdcOutboxBrokerModule.register(
      {
        clientId: Channel.ORDER,
        brokers: ['localhost:9092'],
      },
      {
        database: defaultOptions,
        // schemaRegistry: new SchemaRegistry({
        //   host: 'http://localhost:8081',
        //   clientId: Channel.ORDER,
        // }),
      },
    ),
    MikroOrmModule.forFeature({
      entities: [Order],
    }),
    ConvoySagasModule,
  ],
  controllers: [OrdersController],
  providers: [
    CreateOrderSaga,
    OrderService,
    CustomerServiceProxy,
    // OrderDetails,
    // Order,
    // Money,
  ],
})
export class OrdersModule {}
