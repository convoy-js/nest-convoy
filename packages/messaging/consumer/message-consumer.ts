import { Injectable, Logger, Optional } from '@nestjs/common';
import { Consumer } from '@nest-convoy/core';
import {
  ChannelMapping,
  Message,
  MessageHandler,
} from '@nest-convoy/messaging/common';

import { MessageSubscription } from './message-subscription';

@Injectable()
export abstract class MessageConsumer {
  abstract id: string;
  abstract subscribe(
    subscriberId: string,
    channels: string[],
    handler: Consumer<Partial<Message>>,
  ): MessageSubscription;
  async close(): Promise<void> {}
}

// @Injectable()
// export class KafkaMessageConsumer implements MessageConsumer {}

@Injectable()
export class NestConvoyMessageConsumer implements MessageConsumer {
  private readonly logger = new Logger(this.constructor.name);

  get id(): string {
    return this.target.id;
  }

  constructor(
    private readonly channelMapping: ChannelMapping,
    private readonly target: MessageConsumer,
  ) {
    // super();
  }

  subscribe(
    subscriberId: string,
    channels: string[],
    handler: MessageHandler,
  ): MessageSubscription {
    // this.logger.debug(
    //   `Subscribing: subscriberId = ${subscriberId}, channels = ${channels}`,
    // );

    const transformedChannels = channels.map(channel =>
      this.channelMapping.transform(channel),
    );
    return this.target.subscribe(subscriberId, transformedChannels, handler);
  }

  async close(): Promise<void> {
    await this.target.close();
  }
}
