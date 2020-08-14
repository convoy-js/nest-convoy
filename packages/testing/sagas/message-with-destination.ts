import { Message } from '@nest-convoy/messaging';

export class MessageWithDestination {
  constructor(readonly destination: string, readonly message: Message) {}
}
