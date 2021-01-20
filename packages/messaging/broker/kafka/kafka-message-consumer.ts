import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import {
  MessageHandler,
  MessageConsumer,
  MessageSubscription,
} from '@nest-convoy/messaging';

import { Kafka } from './kafka';
import { KafkaMessageBuilder } from './kafka-message-builder';
import { KafkaMessageProcessor } from './kafka-message-processor';

/*
Aggregates
  Account [ AccountCreatedEvent, AccountDeletedEvent ]
 */

@Injectable()
export class KafkaMessageConsumer
  extends MessageConsumer
  implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly processors = new Map<string, KafkaMessageProcessor>();
  // private swimlaneDispatcher: SwimlaneDispatcher;

  constructor(
    private readonly kafka: Kafka,
    private readonly message: KafkaMessageBuilder,
  ) {
    super();
  }

  private addHandlerToProcessor(
    channel: string,
    handler: MessageHandler,
  ): void {
    const processor =
      this.processors.get(channel) || new KafkaMessageProcessor();
    processor.addHandler(handler);
  }

  private async maybeCommitOffsets(
    processor: KafkaMessageProcessor,
  ): Promise<void> {
    const tpos = processor.topicPartitionOffsetsToCommit();
    await this.kafka.consumer.commitOffsets(tpos);
    processor.noteTopicPartitionOffsetsCommitted(tpos);
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
        this.addHandlerToProcessor(channel, handler);
        // this.addHandlerToChannel(channel, handler);
      }),
    );

    return async () => {
      // TODO: Why is there not an unsubscribe option?
      // await this.kafka.consumer.pause(channels.map(topic => ({ topic })));
      channels.forEach(channel => {
        this.processors.delete(channel);
        // this.handlers.delete(channel);
      });
    };
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.kafka.consumer.run({
      autoCommit: false,
      eachMessage: async payload => {
        const processor = this.processors.get(payload.topic)!;
        const message = this.message.from(payload);

        await processor.process(message, {
          topic: payload.topic,
          offset: payload.message.offset,
          partition: payload.partition,
        });

        await this.maybeCommitOffsets(processor);
        // const handlers = this.getHandlersByChannel(payload.topic);
        //
        // await Promise.all(handlers.map(handle => handle(message)));
      },
    });
    await this.kafka.consumer.connect();
    // this.swimlaneDispatcher = new SwimlaneDispatcher(this.handlers);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.kafka.consumer.disconnect();
  }
}
