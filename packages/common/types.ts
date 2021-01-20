// import { Message } from '@nest-convoy/messaging/common';
import type { Type } from '@nestjs/common';

import type { Handlers } from './handlers';

export type Consumer<T, S = any, A extends unknown[] = unknown[]> = AsyncLikeFn<
  [data: T, ...args: A],
  S
>;

export type AsyncLikeFn<T extends any[] = any[], R = unknown> = (
  ...args: T
) => AsyncLike<R>;

export type AsyncLike<R> = Promise<R> | R;

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
  readonly invoke: H;
}

export interface DispatcherFactory<D, H extends Handlers<any>> {
  create(id: string, handlers: H): D;
}
