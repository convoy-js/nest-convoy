import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NEST_CONVOY_CONNECTION } from '@nest-convoy/common';
import { MessageEntity } from '@nest-convoy/messaging/common/entities';
import { Message } from '@nest-convoy/messaging/common';

import { MessageProducer } from './message-producer';
@Injectable()
export class DatabaseMessageProducer extends MessageProducer {
  constructor(
    @InjectRepository(MessageEntity, NEST_CONVOY_CONNECTION)
    private readonly messageRepository: Repository<MessageEntity<unknown>>,
  ) {
    super();
  }

  async send(destination: string, message: Message): Promise<void> {
    await this.messageRepository.save({
      id: message.id,
      headers: message.getHeaders(),
      payload: message.parsePayload(),
      destination,
    });
  }
}
