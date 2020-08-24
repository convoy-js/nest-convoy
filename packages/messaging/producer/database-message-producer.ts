import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MessageEntity } from '@nest-convoy/messaging/common/entities';
import { Message } from '@nest-convoy/messaging/common';

import { MessageProducer } from './message-producer';

@Injectable()
export class DatabaseMessageProducer extends MessageProducer {
  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepository: Repository<MessageEntity<any>>,
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
