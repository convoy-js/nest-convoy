import { Message } from './message';

export class SubscriberIdAndMessage {
  constructor(readonly subscriberId: string, readonly message: Message) {}
}
