import { Handler } from '@nest-convoy/core';
import { Message } from '@nest-convoy/messaging/common';

import { Command, CommandMessageHeaders } from '../common';
import { CommandMessage } from './command-message';

export type CommandHandlerInvoke<T = any> = (
  cmd: CommandMessage<T>,
  pvs?: Map<string, string>,
) => Message[];

export class CommandHandler implements Handler {
  constructor(
    readonly channel: string,
    readonly command: Command,
    readonly invoke: CommandHandlerInvoke,
  ) {}

  private commandTypeMatches(message: Message): boolean {
    return (
      this.command.constructor.name ===
      message.getRequiredHeader(CommandMessageHeaders.COMMAND_TYPE)
    );
  }

  handles(message: Message): boolean {
    return this.commandTypeMatches(message);
  }
}
