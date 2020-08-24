// import { Message } from '@nest-convoy/messaging/common';

import { Handler } from './types';

export class Handlers<H extends Handler<Function>> {
  constructor(protected readonly handlers: H[]) {}

  findTargetMethod(message: any): H {
    return this.handlers.find(handler => handler.handles(message));
  }
}
