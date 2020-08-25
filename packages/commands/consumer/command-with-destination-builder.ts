import { Builder } from '@nest-convoy/common';
import { Command, ResourcePathPattern } from '@nest-convoy/commands/common';
import {
  MessageHeaders,
  MessageRecordHeaders,
} from '@nest-convoy/messaging/common';

import { CommandWithDestination } from './command-with-destination';

export class CommandWithDestinationBuilder
  implements Builder<CommandWithDestination> {
  static send(command: Command): CommandWithDestinationBuilder {
    return new CommandWithDestinationBuilder(command);
  }

  private extraHeaders?: MessageHeaders;
  private resource?: string;
  private destinationChannel?: string;

  constructor(private readonly command: Command) {}

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
      headers instanceof Map ? headers : new Map(Object.entries(headers));

    return this;
  }

  build(): CommandWithDestination {
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
