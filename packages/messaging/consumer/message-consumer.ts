import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';

import { AsyncFn, Consumer } from '@nest-convoy/common';
import {
  ConvoyChannelMapping,
  Message,
  MessageHandler,
} from '@nest-convoy/messaging/common';

import { MessageSubscription } from './message-subscription';
import { DuplicateMessageDetector } from './duplicate-message-detectors';

@Injectable()
export abstract class MessageConsumer {
  abstract id: string;
  abstract subscribe(
    subscriberId: string,
    channels: string[],
    handler: Consumer<Message>,
    isEventHandler?: boolean,
  ): MessageSubscription;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  close(): Promise<void> | void {}
}

@Injectable()
export class ConvoyMessageConsumer
  implements MessageConsumer, OnApplicationShutdown {
  private readonly subs = new Map<string, AsyncFn>();
  private readonly logger = new Logger(this.constructor.name, true);

  get id(): string {
    return this.target.id;
  }

  constructor(
    private readonly duplicateMessageDetector: DuplicateMessageDetector,
    private readonly channelMapping: ConvoyChannelMapping,
    private readonly target: MessageConsumer,
  ) {}

  async subscribe(
    subscriberId: string,
    channels: string[],
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
      (message: Message) =>
        this.duplicateMessageDetector.doWithMessage(
          subscriberId,
          message,
          handler,
        ),
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
