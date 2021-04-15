import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';

import { Consumer, RuntimeException } from '@nest-convoy/common';
import {
  MessageHandler,
  MessageConsumer,
  MessageSubscription,
  Message,
} from '@nest-convoy/messaging';

import { Kafka } from './kafka';
import { KafkaMessageBuilder } from './kafka-message-builder';
import { KafkaMessageProcessor } from './kafka-message-processor';
import { KafkaMessageHandler } from './kafka-message';

@Injectable()
export class KafkaMessageConsumer
  extends MessageConsumer
  implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(this.constructor.name);
  private readonly processors = new Map<string, KafkaMessageProcessor>();

  constructor(
    private readonly kafka: Kafka,
    private readonly message: KafkaMessageBuilder,
  ) {
    super();
  }

  private addHandlerToProcessor(
    channel: string,
    handler: KafkaMessageHandler,
  ): void {
    if (!this.processors.has(channel)) {
      this.processors.set(channel, new KafkaMessageProcessor());
    }
    this.processors.get(channel)!.addHandler(handler);
  }

  private async maybeCommitOffsets(
    processor: KafkaMessageProcessor,
  ): Promise<void> {
    const tpos = processor.offsetsToCommit();
    const offsets = processor.serializeOffsetsToCommit(tpos);

    this.logger.debug(`Committing offsets ${JSON.stringify(offsets)}`);
    await this.kafka.consumer.commitOffsets(offsets);
    this.logger.debug(`Committed offsets`);

    processor.noteOffsetsCommitted(tpos);
  }

  async subscribe(
    subscriberId: string,
    topics: string[],
    handler: KafkaMessageHandler,
  ): MessageSubscription {
    await Promise.all(
      topics.map(async channel => {
        await this.kafka.consumer.subscribe({
          topic: channel,
          fromBeginning: true,
        });
        this.addHandlerToProcessor(channel, handler);
      }),
    );

    return async () => {
      // TODO: Why is there not an unsubscribe option?
      // await this.kafka.consumer.pause(channels.map(topic => ({ topic })));
      topics.forEach(channel => {
        this.processors.delete(channel);
      });
    };
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.kafka.consumer.run({
      autoCommit: false,
      eachMessage: async payload => {
        const processor = this.processors.get(payload.topic);
        if (!processor) {
          throw new RuntimeException(
            `No KafkaMessageProcessor available for topic ${payload.topic}`,
          );
        }
        const message = await this.message.from(payload);

        await processor.process(message, payload);
        await this.maybeCommitOffsets(processor);
      },
    });
    await this.kafka.consumer.connect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.kafka.consumer.disconnect();
  }
}
