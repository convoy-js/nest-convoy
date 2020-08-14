import { Module } from '@nestjs/common';
import { ConvoyInMemoryMessagingModule } from '@nest-convoy/in-memory';
import { ConvoyCommonModule, ConvoySagasModule } from '@nest-convoy/core';

import { TestCommandsModule } from './commands/test-commands.module';
import { TestEventsModule } from './events/test-events.module';

@Module({
  imports: [
    ConvoyInMemoryMessagingModule.forRoot(),
    ConvoyCommonModule,
    TestCommandsModule,
    TestEventsModule,
  ],
})
export class AppModule {}
