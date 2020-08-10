import { Module } from '@nestjs/common';
import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { ConvoyInMemoryMessagingModule } from '@nest-convoy/in-memory';
import { ConvoyCommonModule } from '@nest-convoy/core';
import { Transport } from '@nestjs/microservices';

import { TestCommandsModule } from './commands/test-commands.module';
import { TestEventsModule } from './events/test-events.module';

@Module({
  imports: [
    // ConvoyInMemoryMessagingModule.register(),
    ConvoyMessagingBrokerModule.register(
      {
        transport: Transport.TCP,
      },
      {
        transport: Transport.TCP,
      },
    ),
    ConvoyCommonModule,
    TestCommandsModule,
    TestEventsModule,
  ],
})
export class AppModule {}
