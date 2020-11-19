import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoyKafkaMessagingBrokerModule } from '@nest-convoy/messaging/broker/kafka';
import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';

import { CreateOrderSaga } from './sagas/create-order';
import { CustomerServiceProxy } from './sagas/participants';
import { Order } from './entities';
import { OrderService } from './order.service';
import { OrdersController } from './orders.controller';
import {
  ConvoySagaTypeOrmModule,
  defaultOptions,
  TypeOrmModuleOptions,
} from '../common';

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
    ConvoyKafkaMessagingBrokerModule.register({
      clientId: 'order',
      brokers: ['localhost:9092'],
    }),
    ConvoySagasModule,
  ],
  controllers: [OrdersController],
  providers: [CreateOrderSaga, OrderService, CustomerServiceProxy],
})
export class OrdersModule {}
