import { Message } from '@nest-convoy/messaging/common';

import { Handlers } from './handlers';

export type Consumer<T, S = void> = (data: T) => Promise<S> | S;

export type Predicate<T> = (...args: any[]) => Promise<boolean> | boolean;

export interface Builder<T> {
  build(): T;
}

export interface Dispatcher {
  subscribe(): Promise<void>;
  handleMessage(message: Message): Promise<void>;
}

export interface Handler<I extends Function> {
  handles(message: Message): boolean;
  invoke: I;
}

export interface DispatcherFactory<D, H extends Handlers<any>> {
  create(id: string, handlers: H): D;
}
