import { Module } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { ConvoyCommandsModule } from '@nest-convoy/commands';
import { ConvoyEventsModule } from '@nest-convoy/events';
import { ConvoySagaModule } from '@nest-convoy/saga';

import { CqrsService } from './cqrs.service';
import { EventBus } from './event-bus';
import { CommandBus } from './command-bus';

@Module({
  imports: [ConvoyEventsModule, ConvoyCommandsModule, ConvoySagaModule],
  providers: [EventBus, CommandBus, ExplorerService, CqrsService],
  exports: [EventBus, CommandBus],
})
export class ConvoyCqrsModule {}
