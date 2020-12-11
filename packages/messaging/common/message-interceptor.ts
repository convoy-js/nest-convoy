import { AsyncLike } from '@nest-convoy/common';

import { Message } from './message';

export interface MessageInterceptor {
  preSend?(message: Message): AsyncLike<void>;
  postSend?(message: Message, error?: Error): AsyncLike<void>;
  preReceive?(message: Message): AsyncLike<void>;
  preHandle?(subscriberId: string, message: Message): AsyncLike<void>;
  postHandle?(subscriberId: string, message: Message): AsyncLike<void>;
  postReceive?(message: Message): AsyncLike<void>;
}
