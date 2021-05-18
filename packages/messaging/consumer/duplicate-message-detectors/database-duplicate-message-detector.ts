import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/core';

import {
  Message,
  ReceivedMessages,
  MessageHandler,
} from '@nest-convoy/messaging/common';

import { DuplicateMessageDetector } from './duplicate-message-detector';

// TODO: Move to /packages/messaging/broker/database
@Injectable()
export class DatabaseDuplicateMessageDetector extends DuplicateMessageDetector {
  constructor(
    @InjectRepository(ReceivedMessages)
    private readonly receivedMessagesRepository: EntityRepository<ReceivedMessages>,
  ) {
    super();
  }

  async isDuplicate(consumerId: string, messageId: string): Promise<boolean> {
    try {
      const receivedMessage = this.receivedMessagesRepository.create({
        consumerId,
        messageId,
      });
      await this.receivedMessagesRepository.persistAndFlush(receivedMessage);

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
