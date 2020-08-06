import { Handler } from '@nest-convoy/common';
import { Message } from '@nest-convoy/messaging/common';
import {
  Command,
  CommandMessageHeaders,
  CommandType,
} from '@nest-convoy/commands/common';

import { CommandMessage } from './command-message';

export type CommandHandlerInvoke<C extends Command = any> = (
  cm: CommandMessage<C>,
  pvs?: Map<string, string>,
) => Promise<Message[]> | Message[];

export class CommandHandler implements Handler<CommandHandlerInvoke> {
  constructor(
    readonly channel: string,
    readonly resource: string | undefined,
    readonly command: CommandType,
    readonly invoke: CommandHandlerInvoke,
  ) {}

  private commandTypeMatches(message: Message): boolean {
    return (
      this.command.name ===
      message.getRequiredHeader(CommandMessageHeaders.COMMAND_TYPE)
      // this.command.name ===
      //   message.getRequiredHeader(
      //     CommandMessageHeaders.inReply(CommandMessageHeaders.COMMAND_TYPE),
      //   )
    );
  }

  handles(message: Message): boolean {
    return this.commandTypeMatches(message);
  }
}
