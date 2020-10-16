import { Module } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';

import { RestaurantServicesModule } from './services';
import { RestaurantServiceChannel } from './api';

@Module({
  imports: [
    ConvoyMessagingBrokerModule.register({
      serviceName: RestaurantServiceChannel.NAME,
      server: {
        transport: Transport.REDIS,
        options: {
          retryAttempts: 2,
          retryDelay: 100,
          url: 'redis://localhost:6379',
        },
      },
      client: {
        transport: Transport.REDIS,
        options: {
          retryAttempts: 2,
          retryDelay: 100,
          url: 'redis://localhost:6379',
        },
      },
    }),
    RestaurantServicesModule,
  ],
})
export class RestaurantModule {}
