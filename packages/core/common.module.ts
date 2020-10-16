import { Module } from '@nestjs/common';

import { ConvoyCommandsModule } from '@nest-convoy/commands';
import { ConvoyEventsModule } from '@nest-convoy/events';
import { ConvoySagasModule } from '@nest-convoy/sagas';

// import { EventBus } from './event-bus';
import { CommandBus } from './command-bus';

@Module({
  imports: [ConvoyEventsModule, ConvoyCommandsModule, ConvoySagasModule],
  providers: [/*EventBus, */ CommandBus],
  exports: [
    ConvoyEventsModule,
    ConvoyCommandsModule,
    ConvoySagasModule,
    /*EventBus, */ CommandBus,
  ],
})
export class ConvoyCommonModule {}
