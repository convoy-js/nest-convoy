import { Module } from '@nestjs/common';

import { CommandDispatcherFactory } from './command-dispatcher-factory';

@Module({
  providers: [CommandDispatcherFactory],
  exports: [CommandDispatcherFactory],
})
export class ConvoyCommandsConsumerModule {}
