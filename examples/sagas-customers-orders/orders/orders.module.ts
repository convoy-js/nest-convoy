import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';
import {
  ConvoyKafkaBrokerModule,
  SchemaRegistry,
} from '@nest-convoy/messaging/broker/kafka';

import { CreateOrderSaga } from './sagas/create-order';
import { CustomerServiceProxy } from './sagas/participants';
import { Order } from './entities';
import { OrderService } from './order.service';
import { OrdersController } from './orders.controller';
import { Channel, defaultOptions, TypeOrmModuleOptions } from '../common';

@Module({
  imports: [
    ConvoyCommonModule,
    TypeOrmModule.forRoot({
      ...defaultOptions,
      schema: 'orders',
      entities: [Order],
    } as TypeOrmModuleOptions),
    TypeOrmModule.forFeature([Order]),
    ConvoyKafkaBrokerModule.register(
      {
        clientId: Channel.ORDER,
        brokers: ['localhost:9092'],
      },
      {
        database: defaultOptions,
        schemaRegistry: new SchemaRegistry({
          host: 'http://localhost:8081',
          clientId: Channel.ORDER,
        }),
      },
    ),
    ConvoySagasModule,
  ],
  controllers: [OrdersController],
  providers: [CreateOrderSaga, OrderService, CustomerServiceProxy],
})
export class OrdersModule {}
