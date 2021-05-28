import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { ConvoyCommonModule } from '@nest-convoy/core';
import { ConvoyKafkaBrokerModule } from '@nest-convoy/kafka';
import { ConvoySagasModule } from '@nest-convoy/sagas';

import { Channel, defaultOptions, Money } from '../common';
import { OrderDetails } from './common';
import { Order } from './entities';
import { OrderRepositoryR } from './order.repository';
import { OrderService } from './order.service';
import { OrdersController } from './orders.controller';
import { CreateOrderSaga } from './sagas/create-order';
import { CustomerServiceProxy } from './sagas/participants';

@Module({
  imports: [
    ConvoyCommonModule,
    ConvoyKafkaBrokerModule.register(
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
      entities: [Order, OrderDetails, Money],
    }),
    ConvoySagasModule,
  ],
  controllers: [OrdersController],
  providers: [
    OrderService,
    OrderRepositoryR,
    CreateOrderSaga,
    CustomerServiceProxy,
  ],
})
export class OrdersModule {}
