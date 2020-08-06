import { Message } from '@nest-convoy/messaging/common';

import { Handlers } from './handlers';

export type Consumer<T, S = any> = (data: T, ...args: any[]) => Promise<S> | S;

export type Predicate<T> = (...args: any[]) => Promise<boolean> | boolean;

export interface Builder<T> {
  build(): T;
}

export interface Dispatcher {
  subscribe(): Promise<void>;
  handleMessage(message: Message): Promise<void>;
}

export interface Handler<I> {
  handles(message: Message): boolean;
  invoke: I;
}

// export interface EventHandler<I = any, T = any> extends BaseHandler<I> {
//   event: Type<T>;
// }
//
// export interface CommandHandler<I = any, T = any> extends BaseHandler<I> {
//   command: Type<T>;
// }
//
// export type Handler<I, T = any> = EventHandler<I, T> | CommandHandler<I, T>;

export interface DispatcherFactory<D, H extends Handlers<any>> {
  create(id: string, handlers: H): D;
}
