// import { Message } from '@nest-convoy/messaging/common';

import { AsyncFn, Handler } from './types';

export class Handlers<H extends Handler<AsyncFn>> {
  constructor(protected readonly handlers: H[]) {}

  findTargetMethod(message: unknown): H | undefined {
    return this.handlers.find(handler => handler.handles(message));
  }
}
