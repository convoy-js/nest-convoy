import { ConsumerGroupJoinEvent } from 'kafkajs';
import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import {
  MessageHandler,
  MessageConsumer,
  MessageSubscription,
  MessageHeaders,
  Message,
} from '@nest-convoy/messaging';

import { KafkaProxy } from './kafka-proxy';
import { KafkaMessageBuilder } from './kafka-message-builder';

@Injectable()
export class KafkaMessageConsumer
  extends MessageConsumer
  implements OnApplicationBootstrap, OnApplicationShutdown {
  constructor(
    private readonly kafka: KafkaProxy,
    private readonly message: KafkaMessageBuilder,
  ) {
    super();
  }

  async subscribe(
    subscriberId: string,
    channels: string[],
    handler: MessageHandler,
    isEventHandler?: boolean,
  ): MessageSubscription {
    await Promise.all(
      channels.map(async channel => {
        await this.kafka.consumer.subscribe({
          topic: channel,
          fromBeginning: true,
        });
        this.addHandlerToChannel(channel, handler);
      }),
    );

    return async () => {
      // TODO: Why is there not a unsubscribe option?
      // await this.kafka.consumer.pause(channels.map(topic => ({ topic })));
      channels.forEach(channel => {
        this.handlers.delete(channel);
      });
    };
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.kafka.consumer.run({
      eachMessage: async payload => {
        const handlers = this.getHandlersByChannel(payload.topic);
        const message = this.message
          .from(payload.message)
          .setHeader(Message.PARTITION_ID, payload.partition.toString());

        await Promise.all(handlers.map(handle => handle(message)));
      },
    });
    await this.kafka.consumer.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.kafka.consumer.disconnect();
  }
}
