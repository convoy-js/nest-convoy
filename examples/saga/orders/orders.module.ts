import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvoyCommonModule } from '@nest-convoy/core';
// import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { Transport } from '@nestjs/microservices';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';

import { Order } from './entities';
import { OrderService } from './services';
import {
  CreateOrderSaga,
  CustomerServiceProxy,
  LocalCreateOrderSaga,
  OrderServiceProxy,
} from './sagas';
import {
  CreateOrderSagaCompletedSuccessfullyHandler,
  CreateOrderSagaRolledBackHandler,
} from './events';

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
    ConvoyCommonModule,
    // TypeOrmModule.forRoot({
    //   ...defaultOptions,
    //   schema: 'orders',
    //   entities: [Order],
    // }),
    // TypeOrmModule.forRoot({
    //   ...defaultOptions,
    //   name: NEST_CONVOY_SAGA_CONNECTION,
    //   schema: 'nest-convoy',
    // }),
    TypeOrmModule.forFeature([Order]),
    // ConvoyMessagingBrokerModule.register(
    //   {
    //     transport: Transport.TCP,
    //   },
    //   {
    //     transport: Transport.TCP,
    //   },
    // ),
  ],
  providers: [
    CreateOrderSagaCompletedSuccessfullyHandler,
    CreateOrderSagaRolledBackHandler,
    LocalCreateOrderSaga,
    CreateOrderSaga,
    OrderServiceProxy,
    CustomerServiceProxy,
    OrderService,
  ],
})
export class OrdersModule {}
