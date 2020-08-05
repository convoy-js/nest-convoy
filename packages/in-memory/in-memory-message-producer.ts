import { Injectable } from '@nestjs/common';
import { MessageProducer } from '@nest-convoy/messaging/producer';
import { Message } from '@nest-convoy/messaging/common';

import { InMemoryMessageConsumer } from './in-memory-message-consumer';

@Injectable()
export class InMemoryMessageProducer extends MessageProducer {
  constructor(private readonly messageConsumer: InMemoryMessageConsumer) {
    super();
  }

  async send(message: Message): Promise<void> {
    await this.messageConsumer.dispatchMessage(message);
  }
}
