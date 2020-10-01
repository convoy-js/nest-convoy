import { Builder } from '@nest-convoy/common';
import { Command, ResourcePathPattern } from '@nest-convoy/commands/common';
import {
  MessageHeaders,
  MessageRecordHeaders,
} from '@nest-convoy/messaging/common';

import { CommandWithDestination } from './command-with-destination';

export class CommandWithDestinationBuilder<C extends Command>
  implements Builder<CommandWithDestination> {
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
      headers instanceof Map ? headers : new Map(Object.entries(headers));

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
