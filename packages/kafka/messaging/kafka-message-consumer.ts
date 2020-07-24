import { Injectable } from '@nestjs/common';
import { MessageHandler } from '@nest-convoy/messaging/common';
import {
  MessageConsumer,
  MessageSubscription,
} from '@nest-convoy/messaging/consumer';

@Injectable()
export class KafkaMessageConsumer extends MessageConsumer {
  id: string;

  subscribe(
    subscriberId: string,
    channels: string[],
    handler: MessageHandler,
  ): MessageSubscription {
    return () => {};
  }

  close(): void {}
}
