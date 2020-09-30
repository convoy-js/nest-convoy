import { AsyncLikeFn, Handler, Instance } from '@nest-convoy/common';
import { Message } from '@nest-convoy/messaging/common';
import {
  Command,
  CommandMessageHeaders,
  CommandType,
  resourceMatches,
} from '@nest-convoy/commands/common';

import { CommandMessage } from './command-message';

export type CommandMessageHandler<
  C extends Command = Command,
  R = Instance | Message | undefined
> = AsyncLikeFn<[cm: CommandMessage<C> /*, pvs?: Map<string, string>*/], R>;

export class CommandHandler implements Handler<CommandMessageHandler> {
  constructor(
    readonly channel: string,
    readonly command: CommandType,
    readonly invoke: CommandMessageHandler,
    readonly resource?: string,
  ) {}

  private resourceMatches(message: Message): boolean {
    return (
      !this.resource ||
      resourceMatches(
        message.getHeader(CommandMessageHeaders.RESOURCE),
        this.resource,
      )
    );
  }

  private commandTypeMatches(message: Message): boolean {
    return (
      this.command.name ===
      message.getRequiredHeader(CommandMessageHeaders.COMMAND_TYPE)
    );
  }

  handles(message: Message): boolean {
    return this.commandTypeMatches(message) && this.resourceMatches(message);
  }
}
