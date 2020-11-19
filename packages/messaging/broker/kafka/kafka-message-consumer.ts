import { Injectable, OnApplicationBootstrap } from '@nestjs/common';

import { Consumer } from '@nest-convoy/common';
import {
  Message,
  MessageConsumer,
  MessageSubscription,
} from '@nest-convoy/messaging';

import { GROUP_ID, KafkaProxy } from './kafka-proxy';
import { KafkaMessageBuilder } from './kafka-message-builder';

@Injectable()
export class KafkaMessageConsumer
  extends MessageConsumer
  implements OnApplicationBootstrap {
  private readonly handlers = new Map<string, readonly Consumer<Message>[]>();

  readonly id = GROUP_ID;

  constructor(
    private readonly kafka: KafkaProxy,
    private readonly message: KafkaMessageBuilder,
  ) {
    super();
  }

  async subscribe(
    subscriberId: string,
    channels: string[],
    handler: Consumer<Message>,
    isEventHandler?: boolean,
  ): MessageSubscription {
    await Promise.all(
      channels.map(async channel => {
        await this.kafka.consumer.subscribe({
          topic: channel,
          fromBeginning: true,
        });
        const handlers = this.handlers.get(channel) || [];
        this.handlers.set(channel, [...handlers, handler]);
      }),
    );

    return async () => {
      // TODO: Why is there not a unsubscribe option?
      await this.kafka.consumer.pause(channels.map(topic => ({ topic })));
      channels.forEach(channel => {
        this.handlers.delete(channel);
      });
    };
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.kafka.consumer.run({
      eachMessage: async payload => {
        if (this.handlers.has(payload.topic)) {
          const handlers = this.handlers.get(payload.topic)!;
          const message = this.message.from(payload.message);
          await Promise.all(handlers.map(handle => handle(message)));
        }
      },
    });
  }
}
