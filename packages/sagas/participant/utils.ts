import { Message } from '@nest-convoy/messaging/common';
import { CommandMessageHeaders } from '@nest-convoy/commands/common';
import { LockTarget, SagaReplyMessage } from '@nest-convoy/commands/consumer';
import { MessageBuilder } from '@nest-convoy/messaging/producer';
import {
  SagaCommandHeaders,
  SagaReplyHeaders,
  SagaUnlockCommand,
} from '@nest-convoy/sagas/common';

export function isUnlockMessage(message: Message): boolean {
  return (
    message.getRequiredHeader(CommandMessageHeaders.COMMAND_TYPE) ===
    SagaUnlockCommand.name
  );
}

export function getSagaType(message: Message): string {
  return message.getRequiredHeader(SagaCommandHeaders.SAGA_TYPE);
}

export function getSagaId(message: Message): string {
  return message.getRequiredHeader(SagaCommandHeaders.SAGA_ID);
}

export function getCommandTarget(message: Message): string {
  return message.getRequiredHeader(CommandMessageHeaders.COMMAND_TYPE);
  // return message.getRequiredHeader(CommandMessageHeaders.RESOURCE);
}

export function addLockedHeader(
  messages: readonly Message[],
  lockedTarget: string,
): readonly Message[] {
  return messages.map(message =>
    MessageBuilder.withMessage(message)
      .withHeader(SagaReplyHeaders.REPLY_LOCKED, lockedTarget)
      .build(),
  );
}

export function getLock(messages: readonly Message[]): LockTarget | undefined {
  return (messages.find(
    message => message instanceof SagaReplyMessage && !!message.lockTarget,
  ) as SagaReplyMessage | undefined)?.lockTarget;
}
