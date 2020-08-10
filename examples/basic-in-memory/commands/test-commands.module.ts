import { Module } from '@nestjs/common';
import { ConvoyCommonModule } from '@nest-convoy/core';

import { TestCommandService } from './test-command.service';
import { DoSomethingCommandHandler } from './test-command.handler';

@Module({
  imports: [ConvoyCommonModule],
  providers: [DoSomethingCommandHandler, TestCommandService],
})
export class TestCommandsModule {}
