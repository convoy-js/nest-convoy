import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NEST_CONVOY_CONNECTION } from '@nest-convoy/common';

import {
  Message,
  ReceivedMessagesEntity,
  MessageHandler,
} from '@nest-convoy/messaging/common';

import { DuplicateMessageDetector } from './duplicate-message-detector';

@Injectable()
export class DatabaseDuplicateMessageDetector extends DuplicateMessageDetector {
  constructor(
    @InjectRepository(ReceivedMessagesEntity, NEST_CONVOY_CONNECTION)
    private readonly receivedMessagesRepository: Repository<
      ReceivedMessagesEntity
    >,
  ) {
    super();
  }

  async isDuplicate(consumerId: string, messageId: string): Promise<boolean> {
    try {
      await this.receivedMessagesRepository.save({
        consumerId,
        messageId,
      });

      return false;
    } catch {
      return true;
    }
  }

  async doWithMessage(
    subscriberId: string,
    message: Message,
    handleMessage: MessageHandler,
  ): Promise<void> {
    if (!(await this.isDuplicate(subscriberId, message.id))) {
      await handleMessage(message);
    }
  }
}
