import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

import { Message } from './message';

export class MissingRequiredMessageHeaderException extends RuntimeException {
  constructor(header: string, message: Message) {
    super(`No such header "${header}" in message - ${message.toString()}`);
  }
}

export class MissingRequiredMessageIDException extends RuntimeException {
  constructor(message: Message) {
    super(`Message needs an ID - ${message.toString()}`);
  }
}
