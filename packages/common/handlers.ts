// import { Message } from '@nest-convoy/messaging/common';

import { Handler } from './types';

export type AsyncFn = (...args: any[]) => Promise<any>;

export class Handlers<H extends Handler<AsyncFn>> {
  constructor(protected readonly handlers: H[]) {}

  findTargetMethod(message: any): H {
    return this.handlers.find(handler => handler.handles(message));
  }
}
