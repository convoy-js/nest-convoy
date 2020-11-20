import { ConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import { Message } from '@nest-convoy/messaging/common';
import { RuntimeException } from '@nest-convoy/common';
import { ConvoyMessageProducer } from '@nest-convoy/messaging/producer';
import {
  SagaLockManager,
  StashMessageRequiredException,
} from '@nest-convoy/sagas/common';
import {
  ConvoyCommandDispatcher,
  CommandHandler,
  CommandHandlers,
  CommandMessage,
} from '@nest-convoy/commands/consumer';

import { SagaCommandHandler } from './saga-command-handler';
import {
  addLockedHeader,
  getCommandTarget,
  getLock,
  getSagaId,
  getSagaType,
  isUnlockMessage,
} from './utils';

export class SagaCommandDispatcher extends ConvoyCommandDispatcher {
  constructor(
    commandDispatcherId: string,
    commandHandlers: CommandHandlers,
    messageConsumer: ConvoyMessageConsumer,
    messageProducer: ConvoyMessageProducer,
    private readonly sagaLockManager: SagaLockManager,
  ) {
    super(
      commandDispatcherId,
      commandHandlers,
      messageConsumer,
      messageProducer,
    );
  }

  protected async invoke(
    commandHandler: CommandHandler,
    commandMessage: CommandMessage,
  ): Promise<readonly Message[]> {
    const sagaType = getSagaType(commandMessage.message);
    const sagaId = getSagaId(commandMessage.message);
    let lockedTarget: string | undefined;

    if (commandHandler instanceof SagaCommandHandler) {
      if (typeof commandHandler.preLock === 'function') {
        lockedTarget = (await commandHandler.preLock(commandMessage)).target;
        if (
          !(await this.sagaLockManager.claimLock(
            sagaType,
            sagaId,
            lockedTarget!,
          ))
        ) {
          throw new StashMessageRequiredException(lockedTarget!);
        }
      }
    }

    const messages = await super.invoke(commandHandler, commandMessage);

    if (lockedTarget) {
      return addLockedHeader(messages, lockedTarget);
    } else {
      const lockTarget = getLock(messages);
      if (lockTarget) {
        if (
          !(await this.sagaLockManager.claimLock(
            sagaType,
            sagaId,
            lockTarget.target,
          ))
        ) {
          throw new RuntimeException('Cannot claim lock');
        }

        return addLockedHeader(messages, lockTarget.target);
      } else {
        return messages;
      }
    }
  }

  async handleMessage(message: Message): Promise<void> {
    const sagaType = getSagaType(message);
    const sagaId = getSagaId(message);
    const target = getCommandTarget(message);

    if (isUnlockMessage(message)) {
      const unlockedMessage = await this.sagaLockManager.unlock(sagaId, target);
      if (unlockedMessage) {
        await super.handleMessage(unlockedMessage);
      }
    } else {
      try {
        await super.handleMessage(message);
      } catch (err) {
        if (err instanceof StashMessageRequiredException) {
          await this.sagaLockManager.stashMessage(
            sagaType,
            sagaId,
            target,
            message,
          );
        } else {
          throw err;
        }
      }
    }
  }
}
