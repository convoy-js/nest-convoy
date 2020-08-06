import { Module } from '@nestjs/common';
import { ConvoyCqrsModule } from '@nest-convoy/cqrs';

import { TestCommandService } from './test-command.service';
import { DoSomethingCommandHandler } from './test-command.handler';

@Module({
  imports: [ConvoyCqrsModule],
  providers: [DoSomethingCommandHandler, TestCommandService],
})
export class TestCommandsModule {}
