import { MessageHeaders } from '@nest-convoy/messaging/common';

export class CommandWithDestination {
  constructor(
    readonly destinationChannel: string,
    readonly command: string,
    readonly extraHeaders: MessageHeaders,
  ) {}
}
