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
    private readonly receivedMessages: EntityRepository<ReceivedMessages>,
  ) {
    super();
  }

  async isDuplicate(consumerId: string, messageId: string): Promise<boolean> {
    try {
      const receivedMessage = this.receivedMessages.create({
        consumerId,
        messageId,
      });
      await this.receivedMessages.persistAndFlush(receivedMessage);

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
      // TODO: DatabaseTransactionContext should be created here
      await handleMessage(message);
    }
  }
}
