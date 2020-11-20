import { Injectable, Logger } from '@nestjs/common';

import { Message, MessageHandler } from '@nest-convoy/messaging/common';
import {
  MessageSubscription,
  MessageConsumer,
} from '@nest-convoy/messaging/consumer';

@Injectable()
export class InMemoryMessageConsumer extends MessageConsumer {
  private readonly logger = new Logger(this.constructor.name, true);
  private subscriptions = new Map<string, readonly MessageHandler[]>();
  private wildcardSubscriptions = new Set<MessageHandler>();

  readonly id = this.constructor.name;

  private addHandlerToChannel(channel: string, handler: MessageHandler): void {
    const storedHandlers = this.subscriptions.get(channel) || [];
    this.subscriptions.set(channel, [...storedHandlers, handler]);
  }

  private async dispatchMessageToHandlers(
    destination: string,
    message: Message,
    handlers: readonly MessageHandler[],
  ): Promise<void> {
    for (const handle of handlers) {
      await handle(message);
    }
  }

  async dispatchMessage(destination: string, message: Message): Promise<void> {
    const handlers = this.subscriptions.get(destination) || [];
    // this.logger.debug(
    //   `Sending message ${message.toString()} to channel ${destination} that has ${
    //     handlers.length
    //   } subscriptions`,
    // );
    await this.dispatchMessageToHandlers(destination, message, handlers);
    // this.logger.debug(
    //   `Sending message ${message.toString()} to wildcard channel ${destination} that has ${
    //     handlers.length
    //   } subscriptions`,
    // );
    await this.dispatchMessageToHandlers(destination, message, [
      ...this.wildcardSubscriptions,
    ]);
  }

  async subscribe(
    subscriberId: string,
    channels: readonly string[],
    handler: MessageHandler,
  ): MessageSubscription {
    channels.forEach(channel => {
      if (channel === '*') {
        this.logger.debug(`Subscribing ${subscriberId} to wildcard channels`);
        this.wildcardSubscriptions.add(handler);
      } else {
        this.logger.debug(
          `Subscribing ${subscriberId} to channels ${channels}`,
        );
        this.addHandlerToChannel(channel, handler);
      }
    });

    return () => {
      this.logger.debug(
        'Closing in-memory consumer for subscriber ' + subscriberId,
      );
      this.wildcardSubscriptions.clear();
      this.subscriptions.clear();
      this.logger.debug('Closed in-memory consumer');
    };
  }
}
