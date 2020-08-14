import { Module } from '@nestjs/common';
import { ConvoyCommandsModule } from '@nest-convoy/commands';
import { ConvoyEventsModule } from '@nest-convoy/events';

import { EventBus } from './event-bus';
import { CommandBus } from './command-bus';

@Module({
  imports: [ConvoyEventsModule, ConvoyCommandsModule],
  providers: [EventBus, CommandBus],
  exports: [ConvoyEventsModule, ConvoyCommandsModule, EventBus, CommandBus],
})
export class ConvoyCommonModule {}
