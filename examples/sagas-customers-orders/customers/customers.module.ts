import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';
import { ConvoyKafkaMessagingBrokerModule } from '@nest-convoy/messaging/broker/kafka';

import { CreditReservation, Customer } from './entities';
import { ReserveCreditCommandHandler } from './commands';
import { CustomerService } from './customer.service';
import { CustomersController } from './customers.controller';
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
      schema: 'customers',
    } as TypeOrmModuleOptions),
    ConvoySagaTypeOrmModule,
    TypeOrmModule.forFeature([CreditReservation, Customer]),
    ConvoyKafkaMessagingBrokerModule.register({
      clientId: 'customer',
      brokers: ['localhost:9092'],
    }),
    ConvoySagasModule,
  ],
  controllers: [CustomersController],
  providers: [CustomerService, ReserveCreditCommandHandler],
})
export class CustomersModule {}
