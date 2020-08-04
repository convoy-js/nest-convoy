import { Builder } from '@nest-convoy/core';
import { Command } from '@nest-convoy/commands/common';

import { CommandWithDestination } from './command-with-destination';
import { MessageHeaders } from '@nest-convoy/messaging/common';

export class CommandWithDestinationBuilder
  implements Builder<CommandWithDestination> {
  private extraHeaders?: MessageHeaders;
  private destinationChannel?: string;

  constructor(private readonly command: Command) {}

  to(destinationChannel: string): this {
    this.destinationChannel = destinationChannel;
    return this;
  }

  withExtraHeaders(
    headers: MessageHeaders | Record<string, string>,
  ): CommandWithDestinationBuilder {
    this.extraHeaders =
      headers instanceof Map ? headers : new Map(Object.entries(headers));

    return this;
  }

  build(): CommandWithDestination {
    return new CommandWithDestination(
      this.destinationChannel,
      this.command,
      null,
      this.extraHeaders,
    );
  }
}
