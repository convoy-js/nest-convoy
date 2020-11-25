import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';
import { ConvoyKafkaMessagingModule } from '@nest-convoy/messaging/broker/kafka';

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
    ConvoyKafkaMessagingModule.register(
      {
        clientId: Channel.CUSTOMER,
        brokers: ['localhost:9092'],
      },
      {
        database: defaultOptions,
      },
    ),
    ConvoySagasModule,
  ],
  controllers: [CustomersController],
  providers: [CustomerService, CustomerCommandHandlers],
})
export class CustomersModule {}
