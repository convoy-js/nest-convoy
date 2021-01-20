// import { Message } from '@nest-convoy/messaging/common';

import type { AsyncLikeFn, Handler } from './types';

export class Handlers<H extends Handler<AsyncLikeFn>> {
  constructor(protected readonly handlers: readonly H[]) {}

  getHandlers(): readonly H[] {
    return this.handlers;
  }

  findTargetMethod(message: unknown): H | undefined {
    return this.handlers.find(handler => handler.handles(message));
  }
}
