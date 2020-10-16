import { Command, CommandType } from '@nest-convoy/commands/common';
import {
  SagaCommandHandlerPreLock,
  CommandHandler,
  CommandMessageHandler,
  CommandMessage,
  CommandMessageHandlerOptions,
} from '@nest-convoy/commands/consumer';

import { PostLock } from './post-lock';

export type SagaCommandHandlerPostLock<T, C = Command> = (
  this: T,
  postLock: PostLock<C>,
) => void;

export class SagaCommandHandler extends CommandHandler {
  constructor(
    channel: string,
    command: CommandType,
    invoke: CommandMessageHandler,
    readonly options: CommandMessageHandlerOptions = {},
    resource?: string,
    readonly preLock?: SagaCommandHandlerPreLock<any>,
    readonly postLock?: SagaCommandHandlerPostLock<any>,
  ) {
    super(channel, command, invoke, options, resource);
  }
}
