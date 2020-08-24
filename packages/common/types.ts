// import { Message } from '@nest-convoy/messaging/common';
import { Type } from '@nestjs/common';

import { Handlers } from './handlers';

export function isType<T>(value: any): value is Type<T> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value.prototype?.constructor === value
  );
}

export type Consumer<T, S = any> = (data: T, ...args: any[]) => Promise<S> | S;

export type Predicate<T> = (...args: any[]) => Promise<boolean> | boolean;

export interface Reply {}

export type ReplyType = Type<Reply>;

export interface Builder<T> {
  build(): T;
}

export interface Dispatcher {
  subscribe(): Promise<void>;
  handleMessage(message: any): Promise<void>;
}

export interface Handler<I> {
  handles(message: any): boolean;
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
