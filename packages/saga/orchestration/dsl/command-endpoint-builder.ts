import { Builder } from '@nest-convoy/core';
import { Command } from '@nest-convoy/commands/common';
import { Type } from '@nestjs/common';

import { CommandEndpoint } from './command-endpoint';

export class CommandEndpointBuilder implements Builder<CommandEndpoint> {
  private replies: Type<any>[] = [];
  private channel: string;

  constructor(private readonly command: Type<Command>) {}

  withChannel(channel: string): this {
    this.channel = channel;
    return this;
  }

  withReply<R>(reply: Type<R>): this {
    this.replies.push(reply);
    return this;
  }

  build(): CommandEndpoint {
    return new CommandEndpoint(this.channel, this.command, this.replies);
  }
}
