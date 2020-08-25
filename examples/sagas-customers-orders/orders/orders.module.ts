import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';

import {
  ConvoySagaTypeOrmModule,
  defaultOptions,
  TypeOrmModuleOptions,
} from '../common';
import { CreateOrderSaga } from './sagas/create-order';
import { CustomerServiceProxy } from './sagas/participants';
import { Order } from './entities';
import { OrderService } from './order.service';
import { OrdersController } from './orders.controller';

@Module({
  imports: [
    ConvoyCommonModule,
    TypeOrmModule.forRoot({
      ...defaultOptions,
      port: 5432,
      schema: 'orders',
      entities: [Order],
    } as TypeOrmModuleOptions),
    ConvoySagaTypeOrmModule,
    TypeOrmModule.forFeature([Order]),
    ConvoyMessagingBrokerModule.register({
      server: {
        transport: Transport.REDIS,
        options: {
          url: 'redis://localhost:6379',
        },
      },
      client: {
        transport: Transport.REDIS,
        options: {
          url: 'redis://localhost:6379',
        },
      },
    }),
    // ConvoyMessagingBrokerModule.register(
    //   {
    //     transport: Transport.KAFKA,
    //     options: {
    //       consumer: {
    //         groupId: 'orders',
    //       },
    //       client: {
    //         clientId: 'orders-consumer',
    //         brokers: ['localhost:9092'],
    //       },
    //     },
    //   },
    //   {
    //     transport: Transport.KAFKA,
    //     options: {
    //       consumer: {
    //         groupId: 'orders',
    //       },
    //       client: {
    //         clientId: 'orders-consumer',
    //         brokers: ['localhost:9092'],
    //       },
    //     },
    //   },
    // ),
    ConvoySagasModule,
  ],
  controllers: [OrdersController],
  providers: [CreateOrderSaga, OrderService, CustomerServiceProxy],
})
export class OrdersModule {}
