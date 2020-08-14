import { Module } from '@nestjs/common';
import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { Transport } from '@nestjs/microservices';
import {
  ConvoyCommonModule,
  ConvoySagasModule,
  NEST_CONVOY_SAGA_CONNECTION,
} from '@nest-convoy/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  TypeOrmModuleOptions,
  defaultOptions,
  ConvoySagaTypeOrmModule,
} from '../common';

import { CreateOrderSaga } from './sagas/create-order';
import { CustomerServiceProxy } from './sagas/participants';
import { Order } from './entities';

@Module({
  imports: [
    ConvoyCommonModule,
    TypeOrmModule.forRoot({
      ...defaultOptions,
      host: 'orders-db',
      port: 5433,
      database: 'orders',
    } as TypeOrmModuleOptions),
    ConvoySagaTypeOrmModule,
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
    ConvoySagasModule,
  ],
  providers: [CreateOrderSaga, CustomerServiceProxy],
})
export class OrdersModule {}
