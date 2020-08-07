import { Module } from '@nestjs/common';
import { ConvoyEventsModule } from '@nest-convoy/events';
import { ConvoyCommandsModule } from '@nest-convoy/commands';
import { ConvoyCqrsModule } from '@nest-convoy/cqrs';

@Module({
  imports: [ConvoyEventsModule, ConvoyCommandsModule, ConvoyCqrsModule],
  exports: [ConvoyEventsModule, ConvoyCommandsModule, ConvoyCqrsModule],
})
export class ConvoyCommonModule {}
