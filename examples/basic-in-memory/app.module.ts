import { Module } from '@nestjs/common';
// import { ConvoyMessagingBrokerModule } from '@nest-convoy/messaging/broker';
import { ConvoyInMemoryMessagingModule } from '@nest-convoy/in-memory';
import { ConvoyCqrsModule } from '@nest-convoy/cqrs';
// import { Transport } from '@nestjs/microservices';

import { TestCommandsModule } from './commands/test-commands.module';
import { TestEventsModule } from './events/test-events.module';

@Module({
  imports: [
    ConvoyInMemoryMessagingModule.register(),
    // ConvoyMessagingBrokerModule.register(
    //   {
    //     transport: Transport.TCP,
    //   },
    //   {
    //     transport: Transport.TCP,
    //   },
    // ),
    ConvoyCqrsModule,
    TestCommandsModule,
    TestEventsModule,
  ],
})
export class AppModule {}
