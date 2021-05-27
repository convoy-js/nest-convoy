import { Injectable } from '@nestjs/common';

import type { Message } from '@nest-convoy/messaging/common';
import { MessageProducer } from '@nest-convoy/messaging/producer';

import { InMemoryMessageConsumer } from './in-memory-message-consumer';

@Injectable()
export class InMemoryMessageProducer extends MessageProducer {
  constructor(private readonly messageConsumer: InMemoryMessageConsumer) {
    super();
  }

  async send(destination: string, message: Message): Promise<void> {
    await this.messageConsumer.dispatchMessage(destination, message);
  }

  async sendBatch(
    destination: string,
    messages: readonly Message[],
    isEvent: boolean,
  ): Promise<void> {
    await Promise.all(
      messages.map(message =>
        this.messageConsumer.dispatchMessage(destination, message),
      ),
    );
  }
}
