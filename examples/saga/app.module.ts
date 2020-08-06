import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { Transport } from '@nestjs/microservices';
import { ConvoyCqrsModule } from '@nest-convoy/cqrs';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { NEST_SAGA_CONNECTION } from '@nest-convoy/saga';

import { CreateOrderSaga } from './sagas/create-order/create-order.saga';
import { Order } from './entities';

const defaultOptions: TypeOrmModuleOptions = {
  type: 'postgres',
  port: 5432,
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
      entities: [Order],
    }),
    TypeOrmModule.forRoot({
      ...defaultOptions,
      name: NEST_SAGA_CONNECTION,
      schema: 'nest-convoy',
    }),
    TypeOrmModule.forFeature([Order]),
    ConvoyMessagingBrokerModule.register(
      {
        transport: Transport.TCP,
      },
      {
        transport: Transport.TCP,
      },
    ),
    ConvoyCqrsModule,
  ],
  providers: [CreateOrderSaga],
})
export class AppModule {}
