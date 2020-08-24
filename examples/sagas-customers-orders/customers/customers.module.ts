import { Module } from '@nestjs/common';
import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { Transport } from '@nestjs/microservices';

import {
  ConvoySagaTypeOrmModule,
  defaultOptions,
  TypeOrmModuleOptions,
} from '../common';

import { CreditReservation, Customer } from './entities';
import { ReserveCreditCommandHandler } from './commands';
import { CustomerService } from './customer.service';
import { CustomersController } from './customers.controller';

@Module({
  imports: [
    ConvoyCommonModule,
    TypeOrmModule.forRoot({
      ...defaultOptions,
      port: 5432,
      schema: 'customers',
    } as TypeOrmModuleOptions),
    ConvoySagaTypeOrmModule,
    TypeOrmModule.forFeature([CreditReservation, Customer]),
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
    //         groupId: 'customers',
    //       },
    //       client: {
    //         clientId: 'customers-consumer',
    //         brokers: ['localhost:9092'],
    //       },
    //     },
    //   },
    //   {
    //     transport: Transport.KAFKA,
    //     options: {
    //       consumer: {
    //         groupId: 'customers',
    //       },
    //       client: {
    //         clientId: 'customers-consumer',
    //         brokers: ['localhost:9092'],
    //       },
    //     },
    //   },
    // ),
    ConvoySagasModule,
  ],
  controllers: [CustomersController],
  providers: [CustomerService, ReserveCreditCommandHandler],
})
export class CustomersModule {}
