import { Message } from '@nest-convoy/messaging/common';

import { Handlers } from './handlers';

export interface Builder<T> {
  build(): T;
}

export interface Dispatcher {
  init(): void;
  handleMessage(message: Message): Promise<void> | void;
}

export interface Handler<I extends Function> {
  handles(message: Message): boolean;
  invoke: I;
}

export interface DispatcherFactory<D, H extends Handlers<any>> {
  create(id: string, handlers: H): D;
}
