// import { Message } from '@nest-convoy/messaging/common';
import { Type } from '@nestjs/common';

import { Handlers } from './handlers';

export function isType<T>(value: any): value is Type<T> {
  return (
    (typeof value === 'object' || typeof value === 'function') &&
    value?.prototype?.constructor === value
  );
}

export type Consumer<T, S = any, A extends unknown[] = unknown[]> = (
  data: T,
  ...args: A
) => AsyncLikeFn<[S]>;

export type AsyncLikeFn<T extends any[] = any[], R = unknown> = (
  ...args: T
) => Promise<R> | R;

export type Predicate<T extends any> = AsyncLikeFn<[T], boolean>;

export interface Reply {}

export type ReplyType = Type<Reply>;

export interface Instance {}

// export interface Instance<T extends Function = Function> extends Object {
//   constructor:
// }

export interface Builder<T> {
  build(): T;
}

export interface Dispatcher {
  subscribe(): Promise<void>;
  handleMessage(message: unknown): Promise<void>;
}

export interface Handler<H extends AsyncLikeFn> {
  handles(message: unknown): boolean;
  invoke: H;
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
