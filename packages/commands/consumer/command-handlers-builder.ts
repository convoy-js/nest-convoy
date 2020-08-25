import { CommandType } from '@nest-convoy/commands/common';
import { Builder } from '@nest-convoy/common';

import { CommandHandler, CommandMessageHandler } from './command-handler';
import { CommandHandlers } from './command-handlers';

export class CommandHandlersBuilder implements Builder<CommandHandlers> {
  static fromChannel(channel: string): CommandHandlersBuilder {
    return new CommandHandlersBuilder(channel);
  }

  private readonly handlers: CommandHandler[] = [];

  constructor(private readonly channel: string) {}

  onMessage(command: CommandType, handler: CommandMessageHandler): this {
    this.handlers.push(new CommandHandler(this.channel, command, handler));
    return this;
  }

  build(): CommandHandlers {
    return new CommandHandlers(this.handlers);
  }
}
