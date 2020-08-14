import { Consumer } from '@nest-convoy/common';
import {
  ConvoyChannelMapping,
  Message,
  MessageHandler,
} from '@nest-convoy/messaging/common';
import {
  Injectable,
  Logger,
  Optional,
  OnApplicationShutdown,
} from '@nestjs/common';

import { MessageSubscription } from './message-subscription';

@Injectable()
export abstract class MessageConsumer {
  abstract id: string;
  abstract subscribe(
    subscriberId: string,
    channels: string[],
    handler: Consumer<Partial<Message>>,
    isEventHandler?: boolean,
  ): MessageSubscription;
  close(): Promise<void> | void {}
}

// @Injectable()
// export class KafkaMessageConsumer implements MessageConsumer {}

@Injectable()
export class ConvoyMessageConsumer
  implements MessageConsumer, OnApplicationShutdown {
  private readonly subs = new Map<string, any>();
  private readonly logger = new Logger(this.constructor.name, true);

  get id(): string {
    return this.target.id;
  }

  constructor(
    private readonly channelMapping: ConvoyChannelMapping,
    private readonly target: MessageConsumer,
  ) {
    // super();
  }

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
      handler,
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

  async onApplicationShutdown(signal?: string): Promise<void> {
    await this.close();
  }
}
