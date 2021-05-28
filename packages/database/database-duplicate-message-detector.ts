import { EntityRepository } from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';

import type { Message, MessageHandler } from '@nest-convoy/messaging/common';
import { ConsumedMessage } from '@nest-convoy/messaging/common';
import { DuplicateMessageDetector } from '@nest-convoy/messaging/consumer';

// TODO: Move to /packages/messaging/broker/database
@Injectable()
export class DatabaseDuplicateMessageDetector extends DuplicateMessageDetector {
  constructor(
    @InjectRepository(ConsumedMessage)
    private readonly consumedMessages: EntityRepository<ConsumedMessage>,
  ) {
    super();
  }

  private async isProcessed(
    consumerId: string,
    messageId: string,
  ): Promise<boolean> {
    const count = await this.consumedMessages.count({
      consumerId,
      messageId,
    });
    return count > 0;
  }

  private setProcessed(consumerId: string, messageId: string): void {
    const consumedMessage = this.consumedMessages.create({
      consumerId,
      messageId,
    });
    this.consumedMessages.persist(consumedMessage);
  }

  async isDuplicate(consumerId: string, messageId: string): Promise<boolean> {
    return false;
  }

  async doWithMessage(
    subscriberId: string,
    message: Message,
    handleMessage: MessageHandler,
  ): Promise<void> {
    if (!(await this.isProcessed(subscriberId, message.id))) {
      await handleMessage(message);
      this.setProcessed(subscriberId, message.id);
    }
  }
}
