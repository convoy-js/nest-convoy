import { Message } from '@nest-convoy/messaging/common';

export class KafkaMessage implements Partial<Message> {
  constructor(private readonly payload: string) {}

  getPayload(): string {
    return this.payload;
  }
}
