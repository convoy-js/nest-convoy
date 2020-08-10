import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
// import { Transport } from '@nestjs/microservices';
// import { ConvoyCqrsModule } from '@nest-convoy/cqrs';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { NEST_CONVOY_SAGA_CONNECTION } from '@nest-convoy/core';
import { ConvoyInMemoryMessagingModule } from '@nest-convoy/in-memory';

import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';

const defaultOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  username: 'nest-convoy',
  password: 'nest-convoy',
  autoLoadEntities: true,
  database: 'postgres',
  synchronize: true,
  migrationsRun: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...defaultOptions,
      schema: 'default',
    }),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: NEST_CONVOY_SAGA_CONNECTION,
      schema: 'nest-convoy',
    }),
    ConvoyInMemoryMessagingModule.forRoot(),
    // ConvoyMessagingBrokerModule.register(
    //   {
    //     transport: Transport.TCP,
    //   },
    //   {
    //     transport: Transport.TCP,
    //   },
    // ),
    // ConvoyCqrsModule,
    CustomersModule,
    OrdersModule,
  ],
})
export class AppModule {}
