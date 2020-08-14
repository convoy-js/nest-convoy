import { Builder } from '@nest-convoy/common';
import { Command, CommandType } from '@nest-convoy/commands/common';
import { Type } from '@nestjs/common';

import { CommandEndpoint } from './command-endpoint';

export class CommandEndpointBuilder<C> implements Builder<CommandEndpoint<C>> {
  private replies: Type<any>[] = [];
  private channel: string;

  constructor(private readonly command: Type<C>) {}

  static forCommand<C extends Command>(
    command: Type<C>,
  ): CommandEndpointBuilder<C> {
    return new CommandEndpointBuilder(command);
  }

  withChannel(channel: string): this {
    this.channel = channel;
    return this;
  }

  withReply<R>(reply: Type<R>): this {
    this.replies.push(reply);
    return this;
  }

  build(): CommandEndpoint<C> {
    return new CommandEndpoint<C>(this.channel, this.command, this.replies);
  }
}
