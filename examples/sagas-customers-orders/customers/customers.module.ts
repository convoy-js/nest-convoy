import { Module } from '@nestjs/common';
import {
  ConvoyCommonModule,
  ConvoySagasModule,
  NEST_CONVOY_SAGA_CONNECTION,
} from '@nest-convoy/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { Transport } from '@nestjs/microservices';

import {
  ConvoySagaTypeOrmModule,
  defaultOptions,
  TypeOrmModuleOptions,
} from '../common';

import { CreditReservation, Customer } from './entities';
import { CustomerService } from './services';
import { ReserveCreditCommandHandler } from './commands';

@Module({
  imports: [
    ConvoyCommonModule,
    TypeOrmModule.forRoot({
      ...defaultOptions,
      host: 'customers-db',
      port: 5435,
      database: 'customers',
    } as TypeOrmModuleOptions),
    ConvoySagaTypeOrmModule,
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
    ConvoySagasModule,
  ],
  providers: [CustomerService, ReserveCreditCommandHandler],
})
export class CustomersModule {}
