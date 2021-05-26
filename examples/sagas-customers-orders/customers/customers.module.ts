import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';

import { ConvoyCommonModule } from '@nest-convoy/core';
import { ConvoyKafkaCdcOutboxBrokerModule } from '@nest-convoy/kafka';

import { Channel, defaultOptions } from '../common';
import { CustomerCommandHandlers } from './customer-command-handlers';
import { CustomerService } from './customer.service';
import { CustomersController } from './customers.controller';
import { CreditReservation, Customer } from './entities';

@Module({
  imports: [
    ConvoyCommonModule,
    ConvoyKafkaCdcOutboxBrokerModule.register(
      {
        clientId: Channel.CUSTOMER,
        brokers: ['localhost:9092'],
      },
      {
        database: defaultOptions,
      },
    ),
    MikroOrmModule.forFeature({
      entities: [CreditReservation, Customer],
    }),
  ],
  controllers: [CustomersController],
  providers: [CustomerService, CustomerCommandHandlers],
})
export class CustomersModule {}
