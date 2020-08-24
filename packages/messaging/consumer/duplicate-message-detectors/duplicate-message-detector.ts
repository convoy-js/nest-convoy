import { Injectable } from '@nestjs/common';
import {
  MessageHandler,
  SubscriberIdAndMessage,
} from '@nest-convoy/messaging/common';

// Default noop message detector
@Injectable()
export class DuplicateMessageDetector {
  async doWithMessage(
    { message, subscriberId }: SubscriberIdAndMessage,
    handleMessage: MessageHandler,
  ): Promise<void> {
    await handleMessage(message);
  }

  async isDuplicate(consumerId: string, messageId: string): Promise<boolean> {
    return false;
  }
}
