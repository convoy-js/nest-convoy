import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';

import { Message } from './message';

export class MissingRequiredMessageHeaderException extends RuntimeException {
  constructor(header: string, message: Message) {
    super(`No such header "${header}" in message - ${JSON.stringify(message)}`);
  }
}
