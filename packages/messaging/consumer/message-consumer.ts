import { Injectable, Logger, Optional } from '@nestjs/common';
import { ChannelMapping, MessageHandler } from '@nest-convoy/messaging/common';

import { MessageSubscription } from './message-subscription';

@Injectable()
export abstract class MessageConsumer {
  abstract id: string;
  abstract subscribe(
    subscriberId: string,
    channels: string[],
    handler: MessageHandler,
  ): MessageSubscription;
  abstract close(): void;
}

// @Injectable()
// export class KafkaMessageConsumer implements MessageConsumer {}

@Injectable()
export class InternalMessageConsumer /* extends MessageConsumer*/ {
  private readonly logger = new Logger(this.constructor.name);

  get id(): string {
    return this.target.id;
  }

  constructor(
    private readonly channelMapping: ChannelMapping,
    @Optional()
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

  close(): void {
    this.target.close();
  }
}
