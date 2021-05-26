import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import { MessageEntity } from '@nest-convoy/messaging/common';
import type { Message } from '@nest-convoy/messaging/common';
import { MessageProducer } from '@nest-convoy/messaging/producer';

@Injectable()
export class DatabaseMessageProducer extends MessageProducer {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messages: EntityRepository<MessageEntity>,
  ) {
    super();
  }

  async send(destination: string, message: Message): Promise<void> {
    await this.sendBatch(destination, [message]);
  }

  async sendBatch(
    destination: string,
    messages: readonly Message[],
  ): Promise<void> {
    messages.forEach(message => {
      const entity = this.messages.create({
        id: message.id,
        headers: message.getHeaders(),
        payload: message.getPayload(),
        destination,
      });
      this.messages.persist(entity);
    });
  }
}
