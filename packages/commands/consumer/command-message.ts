import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { Command } from '@nest-convoy/commands/common';

export class CommandMessage<T extends Command> {
  constructor(
    readonly messageId: string,
    readonly command: T,
    readonly correlationHeaders: MessageHeaders,
    readonly message: Message,
  ) {}
}
