import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { Command } from '@nest-convoy/commands/common';

export class CommandMessage<C extends Command = any> {
  constructor(
    readonly command: C,
    readonly correlationHeaders: MessageHeaders,
    readonly message: Message,
  ) {}
}
