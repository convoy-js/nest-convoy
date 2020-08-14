import { MessageHeaders } from '@nest-convoy/messaging/common';
import { Command } from '@nest-convoy/commands/common';

export class CommandWithDestination<C = Command> implements Command {
  constructor(
    readonly destinationChannel: string,
    readonly command: C,
    readonly resource: string = null,
    readonly extraHeaders: MessageHeaders = new Map(),
  ) {}
}
