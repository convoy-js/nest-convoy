import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, MikroORM } from '@mikro-orm/core';

import { Message, MessageEntity } from '@nest-convoy/messaging/common';
import { MessageProducer } from '@nest-convoy/messaging/producer';

@Injectable()
export class DatabaseMessageProducer extends MessageProducer {
  constructor(
    private readonly orm: MikroORM,
    @InjectRepository(MessageEntity)
    private readonly messageRepository: EntityRepository<MessageEntity>,
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
    await this.orm.em.transactional(async em => {
      messages.forEach(message => {
        const entity = this.messageRepository.create({
          id: message.id,
          headers: message.getHeaders(),
          payload: message.getPayload(),
          destination,
        });
        em.persist(entity);
      });
    });
  }
}
