import { Handle } from '@nest-convoy/core';

import { CommandHandler } from './command-handler';

export class CommandHandlers extends Handle<CommandHandler> {
  getChannels(): string[] {
    return this.handlers.map(handler => handler.channel);
  }
}
