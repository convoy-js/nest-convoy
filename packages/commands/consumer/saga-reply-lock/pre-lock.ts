import { AsyncLikeFn } from '@nest-convoy/common';

import { CommandMessage } from '../command-message';
import { LockTarget } from './lock-target';

export type SagaCommandHandlerPreLock<T> = AsyncLikeFn<
  [commandMessage: CommandMessage],
  LockTarget
>;
