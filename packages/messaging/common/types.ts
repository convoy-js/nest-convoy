import { Message } from './message';

export type MessageHeaders = Map<string, string>;
export type MessageRecordHeaders = Record<string, string>;

export type MessageHandler = (message: Message) => Promise<void> | void;
