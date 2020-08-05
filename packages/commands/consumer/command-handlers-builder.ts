import { CommandType } from '@nest-convoy/commands/common';
import { Builder } from '@nest-convoy/core';
import { Message } from '@nest-convoy/messaging/common';

import { withFailure, withSuccess } from './command-handler-reply-builder';
import { CommandHandler, CommandHandlerInvoke } from './command-handler';
import { CommandHandlers } from './command-handlers';
import { CommandMessage } from './command-message';

export type CommandMessageHandler<C> = (
  cm: CommandMessage<C>,
  pvs?: Record<string, string>,
) => Promise<Message[] | void> | Message[] | void;

export class CommandHandlersBuilder implements Builder<CommandHandlers> {
  private readonly handlers: CommandHandler[] = [];

  constructor(private readonly channel: string) {}

  static fromChannel(channel: string): CommandHandlersBuilder {
    return new CommandHandlersBuilder(channel);
  }

  private wrapMessageHandler(
    handle: CommandHandlerInvoke,
  ): CommandHandlerInvoke {
    return async (cm: CommandMessage): Promise<Message[]> => {
      try {
        const result = await handle(cm);
        return result ?? [withSuccess()];
      } catch (err) {
        return [withFailure(err)];
      }
    };
  }

  onMessage<C>(command: CommandType, handler: CommandMessageHandler<C>): this {
    this.handlers.push(
      new CommandHandler(
        this.channel,
        null,
        command,
        this.wrapMessageHandler(handler),
      ),
    );
    return this;
  }

  build(): CommandHandlers {
    return new CommandHandlers(this.handlers);
  }
}
