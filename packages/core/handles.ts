import { Message } from '@nest-convoy/messaging/common';

export class Handle<H extends Handler<Function>> {
  constructor(protected readonly handlers: H[]) {}

  getHandlers(): H[] {
    return this.handlers;
  }

  findTargetMethod(message: Message): H {
    return this.handlers.find(handler => handler.handles(message));
  }
}

export interface Handler<I extends Function> {
  handles(message: Message): boolean;
  invoke: I;
}
