import { Command } from '@nest-convoy/commands/common';
import { Type } from '@nestjs/common';
import {
  CommandHandler,
  CommandHandlerInvoke,
  CommandMessage,
} from '@nest-convoy/commands/consumer';
import { LockTarget } from '@nest-convoy/saga/common';

import { PostLock } from './post-lock';

export type SagaCommandHandlerPostLock<C = object> = (
  postLock: PostLock<C>,
) => void;
export type SagaCommandHandlerPreLock = (
  commandMessage: CommandMessage,
) => LockTarget;

export class SagaCommandHandler extends CommandHandler {
  constructor(
    channel: string,
    resource: string | undefined,
    command: Type<Command>,
    invoke: CommandHandlerInvoke,
    readonly preLock?: SagaCommandHandlerPreLock,
    readonly postLock?: SagaCommandHandlerPostLock,
  ) {
    super(channel, resource, command, invoke);
  }
}
