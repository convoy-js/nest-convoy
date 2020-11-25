import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';

import { AsyncLikeFn } from '@nest-convoy/common';
import {
  ConvoyChannelMapping,
  Message,
  MessageHandler,
} from '@nest-convoy/messaging/common';

import { MessageSubscription } from './message-subscription';
import { DuplicateMessageDetector } from './duplicate-message-detectors';

@Injectable()
export abstract class MessageConsumer {
  protected readonly handlers = new Map<string, readonly MessageHandler[]>();

  protected addHandlerToChannel(
    channel: string,
    handler: MessageHandler,
  ): void {
    const handlers = this.handlers.get(channel) || [];
    this.handlers.set(channel, [...handlers, handler]);
  }

  protected getHandlersByChannel(channel: string): readonly MessageHandler[] {
    return this.handlers.get(channel) || [];
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  abstract subscribe(
    subscriberId: string,
    channels: readonly string[],
    handler: MessageHandler,
    isEventHandler?: boolean,
  ): MessageSubscription;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  close(): Promise<void> | void {}
}

@Injectable()
export class ConvoyMessageConsumer
  extends MessageConsumer
  implements OnApplicationShutdown {
  private readonly subs = new Map<string, AsyncLikeFn>();
  private readonly logger = new Logger(this.constructor.name, true);

  constructor(
    private readonly duplicateMessageDetector: DuplicateMessageDetector,
    private readonly channelMapping: ConvoyChannelMapping,
    private readonly target: MessageConsumer,
  ) {
    super();
  }

  async handleMessage(
    subscriberId: string,
    message: Message,
    handler: MessageHandler,
  ): Promise<void> {
    // TODO: Should be able to remove this now since brokers handle subscribers and acknowledgement
    await this.duplicateMessageDetector.doWithMessage(
      subscriberId,
      message,
      handler,
    );
  }

  async subscribe(
    subscriberId: string,
    channels: readonly string[],
    handler: MessageHandler,
    isEventHandler?: boolean,
  ): MessageSubscription {
    this.logger.debug(`Subscribing ${subscriberId} to channels ${channels}`);
    const transformedChannels = channels.map(channel =>
      this.channelMapping.transform(channel),
    );
    const sub = await this.target.subscribe(
      subscriberId,
      transformedChannels,
      (message: Message) => this.handleMessage(subscriberId, message, handler),
      isEventHandler,
    );
    this.subs.set(subscriberId, sub);
    return sub;
  }

  async close(): Promise<void> {
    for (const unsubscribe of this.subs.values()) {
      await unsubscribe();
    }
    await this.target.close();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.close();
  }
}
