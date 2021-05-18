import { CommandEndpoint } from './command-endpoint';

import type { Type, Builder } from '@nest-convoy/common';
import type { Command } from '@nest-convoy/commands/common';

export class CommandEndpointBuilder<C extends Command>
  implements Builder<CommandEndpoint<C>>
{
  static forCommand<C extends Command>(
    command: Type<C>,
  ): CommandEndpointBuilder<C> {
    return new CommandEndpointBuilder(command);
  }

  private readonly replies: Type<any>[] = [];
  private channel: string;

  constructor(private readonly command: Type<C>) {}

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
