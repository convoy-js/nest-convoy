import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoyKafkaBrokerModule } from '@nest-convoy/messaging/broker/kafka';
import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';

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
      },
    ),
    ConvoySagasModule,
  ],
  controllers: [OrdersController],
  providers: [CreateOrderSaga, OrderService, CustomerServiceProxy],
})
export class OrdersModule {}
