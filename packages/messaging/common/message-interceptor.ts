import { AsyncLike, Type } from '@nest-convoy/common';
import { Injectable } from '@nestjs/common';

import { Message } from './message';

export const NEST_CONVOY_MESSAGE_INTERCEPTOR = Symbol(
  'NEST_CONVOY_MESSAGE_INTERCEPTOR',
);

export function MessageInterceptor() {
  return (target: Type<NestMessageInterceptor>) => {
    Injectable()(target);
    Reflect.defineMetadata(NEST_CONVOY_MESSAGE_INTERCEPTOR, true, target);
  };
}

export interface NestMessageInterceptor {
  preSend?(message: Message): AsyncLike<void>;
  postSend?(message: Message, error?: Error): AsyncLike<void>;
  preReceive?(message: Message): AsyncLike<void>;
  preHandle?(subscriberId: string, message: Message): AsyncLike<void>;
  postHandle?(subscriberId: string, message: Message): AsyncLike<void>;
  postReceive?(message: Message): AsyncLike<void>;
}
