import { Message } from '@nest-convoy/messaging/common';
import { CommandMessageHeaders } from '@nest-convoy/commands/common';
import { MessageBuilder } from '@nest-convoy/messaging/producer';
import {
  LockTarget,
  SagaCommandHeaders,
  SagaReplyHeaders,
  SagaUnlockCommand,
} from '@nest-convoy/saga/common';
import { SagaReplyMessage } from '@nest-convoy/saga/participant/saga-reply-message';

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
  messages: Message[],
  lockedTarget: string,
): Message[] {
  return messages.map(message =>
    MessageBuilder.withMessage(message)
      .withHeader(SagaReplyHeaders.REPLY_LOCKED, lockedTarget)
      .build(),
  );
}

export function getLock(messages: Message[]): LockTarget | null {
  return (messages.find(
    message =>
      message instanceof SagaReplyMessage && message.lockTarget != null,
  ) as SagaReplyMessage | null)?.lockTarget;
}

// export function getLock(List<Message> messages) {
//   return messages.stream().filter(m -> m instanceof SagaReplyMessage && ((SagaReplyMessage) m).hasLockTarget()).findFirst().flatMap(m -> ((SagaReplyMessage)m).getLockTarget());
// }
