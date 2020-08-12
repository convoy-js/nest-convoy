import { Module } from '@nestjs/common';
import {
  ConvoyCommonModule,
  NEST_CONVOY_SAGA_CONNECTION,
} from '@nest-convoy/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { Transport } from '@nestjs/microservices';

import { defaultOptions, TypeOrmModuleOptions } from '../common';

import { CreditReservation, Customer } from './entities';
import { CustomerService } from './services';
import { ReserveCreditCommandHandler } from './commands';

@Module({
  imports: [
    ConvoyCommonModule,
    TypeOrmModule.forRoot({
      ...defaultOptions,
      host: 'customer-db',
      database: 'customerdb',
    } as TypeOrmModuleOptions),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: NEST_CONVOY_SAGA_CONNECTION,
      host: 'sagas-db',
      database: 'sagasdb',
    } as TypeOrmModuleOptions),
    TypeOrmModule.forFeature([CreditReservation, Customer]),
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
  providers: [CustomerService, ReserveCreditCommandHandler],
})
export class CustomersModule {}
