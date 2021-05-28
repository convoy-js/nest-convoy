import type { Command } from '@nest-convoy/commands/common';
import { ResourcePathPattern } from '@nest-convoy/commands/common';
import type { Builder } from '@nest-convoy/common';
import type { MessageRecordHeaders } from '@nest-convoy/messaging/common';
import { MessageHeaders } from '@nest-convoy/messaging/common';

import { CommandWithDestination } from './command-with-destination';

export class CommandWithDestinationBuilder<C extends Command>
  implements Builder<CommandWithDestination>
{
  static send<C extends Command>(command: C): CommandWithDestinationBuilder<C> {
    return new CommandWithDestinationBuilder(command);
  }

  private extraHeaders?: MessageHeaders;
  private resource?: string;
  private destinationChannel?: string;

  constructor(private readonly command: C) {}

  to(destinationChannel: string): this {
    this.destinationChannel = destinationChannel;
    return this;
  }

  forResource(resource: string, ...pathParams: Record<string, string>[]): this {
    this.resource = new ResourcePathPattern(resource)
      .replacePlaceholders(pathParams)
      .toPath();

    return this;
  }

  withExtraHeaders(headers: MessageHeaders | MessageRecordHeaders): this {
    this.extraHeaders =
      headers instanceof MessageHeaders
        ? headers
        : MessageHeaders.fromRecord(headers);

    return this;
  }

  build(): CommandWithDestination<C> {
    if (!this.destinationChannel) {
      throw new Error('Destination is required');
    }

    return new CommandWithDestination(
      this.destinationChannel,
      this.command,
      this.resource,
      this.extraHeaders,
    );
  }
}
