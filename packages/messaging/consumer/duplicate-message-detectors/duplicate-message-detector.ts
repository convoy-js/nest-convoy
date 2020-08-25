import { Injectable } from '@nestjs/common';

import { Message, MessageHandler } from '@nest-convoy/messaging/common';

@Injectable()
export class DuplicateMessageDetector {
  async doWithMessage(
    subscriberId: string,
    message: Message,
    handleMessage: MessageHandler,
  ): Promise<void> {
    await handleMessage(message);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async isDuplicate(consumerId: string, messageId: string): Promise<boolean> {
    return false;
  }
}
