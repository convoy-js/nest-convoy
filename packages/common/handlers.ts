// import { Message } from '@nest-convoy/messaging/common';

import { AsyncLikeFn, Handler } from './types';

export class Handlers<H extends Handler<AsyncLikeFn>> {
  constructor(protected readonly handlers: H[]) {}

  findTargetMethod(message: unknown): H | undefined {
    return this.handlers.find(handler => handler.handles(message));
  }
}
