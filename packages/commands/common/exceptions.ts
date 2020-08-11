import { RuntimeException } from '@nest-convoy/common';
import { Message } from '@nest-convoy/messaging/common';

export class MissingCommandHandlerException extends RuntimeException {
  constructor(message: Message) {
    super(`No command handler found for message ${message.id}`);
  }
}
