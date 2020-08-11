import { Builder } from '@nest-convoy/common';
import { Command, ResourcePathPattern } from '@nest-convoy/commands/common';
import { MessageHeaders } from '@nest-convoy/messaging/common';

import { CommandWithDestination } from './command-with-destination';

export class CommandWithDestinationBuilder
  implements Builder<CommandWithDestination> {
  private extraHeaders?: MessageHeaders;
  private destinationChannel?: string;
  private resource?: string;

  constructor(private readonly command: Command) {}

  static send(command: Command): CommandWithDestinationBuilder {
    return new CommandWithDestinationBuilder(command);
  }

  to(destinationChannel: string): this {
    this.destinationChannel = destinationChannel;
    return this;
  }

  forResource(resource: string, ...pathParams: Record<string, string>[]) {
    this.resource = new ResourcePathPattern(resource)
      .replacePlaceholders(pathParams)
      .toPath();

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
      this.resource,
      this.extraHeaders,
    );
  }
}
