import { MessageHandler } from '../common';

export interface MessageConsumer {
  id: string;
  subscribe(
    subscriberId: string,
    channels: Set<string>,
    handler: MessageHandler,
  );
  close(): void;
}
