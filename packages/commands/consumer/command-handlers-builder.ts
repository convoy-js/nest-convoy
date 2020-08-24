import { Command, CommandType } from '@nest-convoy/commands/common';
import { Builder } from '@nest-convoy/common';
import { Message } from '@nest-convoy/messaging/common';

import { CommandHandler } from './command-handler';
import { CommandHandlers } from './command-handlers';
import { CommandMessage } from './command-message';

export type CommandMessageHandler<C extends Command = any> = (
  cm: CommandMessage<C>,
  pvs?: Map<string, string>,
) => Promise<Message | any> | Message | any;

export class CommandHandlersBuilder implements Builder<CommandHandlers> {
  private readonly handlers: CommandHandler[] = [];

  constructor(private readonly channel: string) {}

  static fromChannel(channel: string): CommandHandlersBuilder {
    return new CommandHandlersBuilder(channel);
  }

  onMessage(command: CommandType, handler: CommandMessageHandler): this {
    this.handlers.push(new CommandHandler(this.channel, command, handler));
    return this;
  }

  build(): CommandHandlers {
    return new CommandHandlers(this.handlers);
  }
}
