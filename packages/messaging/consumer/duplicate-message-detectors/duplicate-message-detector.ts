import { Injectable } from '@nestjs/common';
import { Message, MessageHandler } from '@nest-convoy/messaging/common';

// Default noop message detector
@Injectable()
export class DuplicateMessageDetector {
  async doWithMessage(
    subscriberId: string,
    message: Message,
    handleMessage: MessageHandler,
  ): Promise<void> {
    await handleMessage(message);
  }

  async isDuplicate(consumerId: string, messageId: string): Promise<boolean> {
    return false;
  }
}
