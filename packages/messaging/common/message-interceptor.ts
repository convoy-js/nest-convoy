import { Message } from './message';

export interface MessageInterceptor {
  preSend?(message: Message): Promise<void> | void;
  postSend?(message: Message, error?: Error): Promise<void> | void;
  preReceive?(message: Message): Promise<void> | void;
  preHandle?(subscriberId: string, message: Message): Promise<void> | void;
  postHandle?(subscriberId: string, message: Message): Promise<void> | void;
  postReceive?(message: Message): Promise<void> | void;
}
