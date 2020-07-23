import { Message } from '@nest-convoy/messaging/common';

export class Handle<H extends Handler> {
  constructor(protected readonly handlers: H[]) {}

  getHandlers(): H[] {
    return this.handlers;
  }

  findTargetMethod(message: Message): H {
    return this.handlers.find(handler => handler.handles(message));
  }
}

export interface Handler {
  handles(message: Message): boolean;
}
