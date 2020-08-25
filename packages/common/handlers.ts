// import { Message } from '@nest-convoy/messaging/common';

import { Handler } from './types';

export type AsyncFn<T extends any[] = any[], R = unknown> = (
  ...args: T
) => Promise<R> | R;

export class Handlers<H extends Handler<AsyncFn>> {
  constructor(protected readonly handlers: H[]) {}

  findTargetMethod(message: unknown): H | undefined {
    return this.handlers.find(handler => handler.handles(message));
  }
}
