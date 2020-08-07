import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvoyCommonModule } from '@nest-convoy/core';
import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { Transport } from '@nestjs/microservices';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { NEST_CONVOY_SAGA_CONNECTION } from '@nest-convoy/saga';

import { ReserveCreditCommandHandler } from './commands/reserve-credit-command.handler';
import { CreditReservation, Customer } from './entities';
import { CustomerService } from './services';

// const defaultOptions: TypeOrmModuleOptions = {
//   type: 'postgres',
//   port: 5432,
//   username: 'nest-convoy',
//   password: 'nest-convoy',
//   autoLoadEntities: true,
//   database: 'postgres',
//   synchronize: true,
//   migrationsRun: true,
// };

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   ...defaultOptions,
    //   schema: 'customers',
    //   entities: [Customer, CreditReservation],
    // }),
    // TypeOrmModule.forRoot({
    //   ...defaultOptions,
    //   name: NEST_CONVOY_SAGA_CONNECTION,
    //   schema: 'nest-convoy',
    // }),
    TypeOrmModule.forFeature([Customer, CreditReservation]),
    // ConvoyMessagingBrokerModule.register(
    //   {
    //     transport: Transport.TCP,
    //   },
    //   {
    //     transport: Transport.TCP,
    //   },
    // ),
    ConvoyCommonModule,
  ],
  providers: [ReserveCreditCommandHandler, CustomerService],
  exports: [TypeOrmModule],
})
export class CustomersModule {}
