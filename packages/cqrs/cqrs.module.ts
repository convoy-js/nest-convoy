import { Module, OnModuleInit } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { ConvoyCommandsModule } from '@nest-convoy/commands';
import { ConvoyEventsModule } from '@nest-convoy/events';

import { CqrsService } from './cqrs.service';
import { EventBus } from './event-bus';
import { CommandBus } from './command-bus';

@Module({
  imports: [CqrsModule, ConvoyEventsModule, ConvoyCommandsModule],
  providers: [EventBus, CommandBus, ExplorerService, CqrsService],
  exports: [EventBus, CommandBus],
})
export class ConvoyCqrsModule {}
