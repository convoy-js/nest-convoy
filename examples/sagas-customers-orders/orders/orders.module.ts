import { Module } from '@nestjs/common';
import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { Transport } from '@nestjs/microservices';
import {
  ConvoyCommonModule,
  NEST_CONVOY_SAGA_CONNECTION,
} from '@nest-convoy/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeOrmModuleOptions, defaultOptions } from '../common';

import { CreateOrderSaga } from './sagas/create-order';
import { CustomerServiceProxy } from './sagas/participants';
import { Order } from './entities';

@Module({
  imports: [
    ConvoyCommonModule,
    TypeOrmModule.forRoot({
      ...defaultOptions,
      host: 'order-db',
      database: 'orderdb',
    } as TypeOrmModuleOptions),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: NEST_CONVOY_SAGA_CONNECTION,
      host: 'sagas-db',
      database: 'sagasdb',
    } as TypeOrmModuleOptions),
    TypeOrmModule.forFeature([Order]),
    ConvoyMessagingBrokerModule.register(
      {
        transport: Transport.KAFKA,
      },
      {
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: ['kafka:9092'],
          },
        },
      },
    ),
  ],
  providers: [CreateOrderSaga, CustomerServiceProxy],
})
export class OrdersModule {}
