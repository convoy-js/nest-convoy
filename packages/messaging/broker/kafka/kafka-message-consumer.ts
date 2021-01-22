import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Runtime } from 'inspector';
import { of } from 'rxjs';

import { RuntimeException } from '@nest-convoy/common';
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
  private readonly logger = new Logger(this.constructor.name);
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
        const processor = this.processors.get(payload.topic);
        if (!processor) {
          throw new RuntimeException(
            `No KafkaMessageProcessor available for topic ${payload.topic}`,
          );
        }
        const message = await this.message.from(payload);
        console.log('eachMessage', message.toString());

        await processor.process(message, payload);
        await this.maybeCommitOffsets(processor);
        // const handlers = this.getHandlersByChannel(payload.topic);
        //
        // await Promise.all(handlers.map(handle => handle(message)));
      },
      eachBatch: async payload => console.log('eachBatch', payload),
    });
    await this.kafka.consumer.connect();
    // this.swimlaneDispatcher = new SwimlaneDispatcher(this.handlers);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.kafka.consumer.disconnect();
  }
}
