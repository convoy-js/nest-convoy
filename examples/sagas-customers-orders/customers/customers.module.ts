import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';
import { ConvoyKafkaCdcOutboxBrokerModule } from '@nest-convoy/messaging/broker/kafka';

import { CreditReservation, Customer } from './entities';
import { CustomerCommandHandlers } from './customer-command-handlers';
import { CustomerService } from './customer.service';
import { CustomersController } from './customers.controller';
import { Channel, defaultOptions, TypeOrmModuleOptions } from '../common';

@Module({
  imports: [
    ConvoyCommonModule,
    TypeOrmModule.forRoot({
      ...defaultOptions,
      schema: 'customers',
    } as TypeOrmModuleOptions),
    TypeOrmModule.forFeature([CreditReservation, Customer]),
    ConvoyKafkaCdcOutboxBrokerModule.register(
      {
        clientId: Channel.CUSTOMER,
        brokers: ['localhost:9092'],
      },
      {
        database: defaultOptions,
        // schemaRegistry: new SchemaRegistry({
        //   host: 'http://localhost:8081',
        //   clientId: Channel.CUSTOMER,
        // }),
      },
    ),
    ConvoySagasModule,
  ],
  controllers: [CustomersController],
  providers: [
    CustomerService,
    CustomerCommandHandlers,
    // Money,
    // ReserveCreditCommand,
    // CustomerCreditReserved,
    // CustomerNotFound,
    // CustomerCreditLimitExceeded,
  ],
})
export class CustomersModule {}
