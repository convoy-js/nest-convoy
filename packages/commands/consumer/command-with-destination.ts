import { MessageHeaders } from '@nest-convoy/messaging/common';
import { Command } from '@nest-convoy/commands/common';

export class CommandWithDestination implements Command {
  constructor(
    readonly destinationChannel: string,
    readonly command: Command,
    readonly resource: string = null,
    readonly extraHeaders: MessageHeaders = new Map(),
  ) {}
}
