import { Injectable, Logger } from '@nestjs/common';

import type { Message, MessageHandler } from '@nest-convoy/messaging/common';
import type { MessageSubscription } from '@nest-convoy/messaging/consumer';
import { MessageConsumer } from '@nest-convoy/messaging/consumer';

@Injectable()
export class InMemoryMessageConsumer extends MessageConsumer {
  private readonly logger = new Logger(this.constructor.name, true);
  // private wildcardSubscriptions = new Set<MessageHandler>();

  private async dispatchMessageToHandlers(
    message: Message,
    handlers: readonly MessageHandler[],
  ): Promise<void> {
    await Promise.all(handlers.map(handle => handle(message)));
  }

  async dispatchMessage(destination: string, message: Message): Promise<void> {
    const handlers = this.getHandlersByChannel(destination);
    await this.dispatchMessageToHandlers(message, handlers);
    // await this.dispatchMessageToHandlers(message, [
    //   ...this.wildcardSubscriptions,
    // ]);
  }

  async subscribe(
    subscriberId: string,
    channels: readonly string[],
    handler: MessageHandler,
  ): MessageSubscription {
    channels.forEach(channel => {
      // if (channel === '*') {
      //   this.logger.debug(`Subscribing ${subscriberId} to wildcard channels`);
      //   this.wildcardSubscriptions.add(handler);
      // } else {
      this.logger.debug(`Subscribing ${subscriberId} to channels ${channels}`);
      this.addHandlerToChannel(channel, handler);
      // }
    });

    return () => {
      this.logger.debug(
        `Closing in-memory consumer for subscriber ${subscriberId}`,
      );
      // this.wildcardSubscriptions.clear();
      this.handlers.clear();
      this.logger.debug('Closed in-memory consumer');
    };
  }
}
