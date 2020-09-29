import { Command, CommandType } from '@nest-convoy/commands/common';
import {
  LockTarget,
  CommandHandler,
  CommandMessageHandler,
  CommandMessage,
} from '@nest-convoy/commands/consumer';

import { PostLock } from './post-lock';

export type SagaCommandHandlerPostLock<C = Command> = (
  postLock: PostLock<C>,
) => void;
export type SagaCommandHandlerPreLock = (
  commandMessage: CommandMessage,
) => LockTarget;

export class SagaCommandHandler extends CommandHandler {
  constructor(
    channel: string,
    command: CommandType,
    invoke: CommandMessageHandler,
    resource?: string,
    readonly preLock?: SagaCommandHandlerPreLock,
    readonly postLock?: SagaCommandHandlerPostLock,
  ) {
    super(channel, command, invoke, resource);
  }
}
