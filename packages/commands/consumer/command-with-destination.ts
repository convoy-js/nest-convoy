import { MessageHeaders } from '@nest-convoy/messaging/common';
import { Command } from '@nest-convoy/commands/common';

export class CommandWithDestination {
  constructor(
    readonly destinationChannel: string,
    readonly command: Command,
    readonly extraHeaders: MessageHeaders,
  ) {}
}
