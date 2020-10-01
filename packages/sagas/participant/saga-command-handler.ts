import { Command, CommandType } from '@nest-convoy/commands/common';
import {
  SagaCommandHandlerPreLock,
  CommandHandler,
  CommandMessageHandler,
  CommandMessage,
  CommandMessageHandlerOptions,
} from '@nest-convoy/commands/consumer';

import { PostLock } from './post-lock';

export type SagaCommandHandlerPostLock<C = Command> = (
  postLock: PostLock<C>,
) => void;

export class SagaCommandHandler extends CommandHandler {
  constructor(
    channel: string,
    command: CommandType,
    invoke: CommandMessageHandler,
    readonly options: CommandMessageHandlerOptions = {},
    resource?: string,
    readonly preLock?: SagaCommandHandlerPreLock,
    readonly postLock?: SagaCommandHandlerPostLock,
  ) {
    super(channel, command, invoke, options, resource);
  }
}
