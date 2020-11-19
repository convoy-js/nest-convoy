import { Module } from '@nestjs/common';

import { ConvoyCommandsModule } from '@nest-convoy/commands';
import { ConvoyEventsModule } from '@nest-convoy/events';
import { ConvoySagasModule } from '@nest-convoy/sagas';

@Module({
  imports: [ConvoyEventsModule, ConvoyCommandsModule, ConvoySagasModule],
  exports: [ConvoyEventsModule, ConvoyCommandsModule, ConvoySagasModule],
})
export class ConvoyCommonModule {}
