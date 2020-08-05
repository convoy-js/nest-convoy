import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  CommandDispatcherFactory,
  CommandHandlersBuilder,
  CommandMessage,
} from '@nest-convoy/commands/consumer';

import { DoSomethingCommand } from './do-something-command';
import { COMMAND_DISPATCHER_ID, REPLY_CHANNEL } from './tokens';

@Injectable()
export class TestCommandHandler implements OnModuleInit {
  constructor(
    private readonly commandDispatcherFactory: CommandDispatcherFactory,
  ) {}

  private async doSomething(
    cm: CommandMessage<DoSomethingCommand>,
    pvs?: Record<string, string>,
  ): Promise<void> {
    // TODO: Wrap message handlers in a context, so if it doesn't return anything, it should by default return withSuccess, and if an error is thrown it should return withFailure
    console.log(cm);
    console.log(pvs);
  }

  async onModuleInit(): Promise<void> {
    const commandHandlers = CommandHandlersBuilder.fromChannel(REPLY_CHANNEL)
      .onMessage(DoSomethingCommand, this.doSomething)
      .build();

    await this.commandDispatcherFactory
      .create(COMMAND_DISPATCHER_ID, commandHandlers)
      .subscribe();
  }
}
