import { Handle } from '@nest-convoy/core';
import { CommandHandler } from '@nest-convoy/commands/consumer/command-handler';

export class CommandHandlers extends Handle<CommandHandler> {
  getChannels(): Set<string> {
    return new Set(this.handlers.map(handler => handler.channel));
  }
}
