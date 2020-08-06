import { Consumer } from 'kafkajs';
import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  MessageConsumer,
  MessageSubscription,
} from '@nest-convoy/messaging/consumer';
import {
  KafkaMessagingConsumerModuleOptions,
  PARTIAL_KAFKA_CONSUMER_OPTIONS,
  KafkaClient,
} from '@nest-convoy/kafka/common';

import { KafkaMessageHandler } from './kafka-message-handler';
import { KafkaMessage } from './kafka-message';
import { SwimlaneBasedDispatcher } from './swimlane';

@Injectable()
export class KafkaMessageConsumer extends MessageConsumer {
  readonly id = uuidv4();

  private readonly consumers = new Set<Consumer>();

  constructor(
    private readonly kafka: KafkaClient,
    @Inject(PARTIAL_KAFKA_CONSUMER_OPTIONS)
    private readonly options: KafkaMessagingConsumerModuleOptions,
  ) {
    super();
  }

  async subscribe(
    subscriberId: string,
    channels: string[],
    handler: KafkaMessageHandler,
  ): MessageSubscription {
    const swimlaneBasedDispatcher = new SwimlaneBasedDispatcher(/*subscriberId*/);
    const kc = this.kafka.consumer({
      groupId: subscriberId,
      ...this.options,
    });

    this.consumers.add(kc);
    await kc.connect();

    for (const topic of channels) {
      await kc.subscribe({ topic });
    }

    await kc.run({
      eachBatchAutoResolve: true,
      autoCommit: true,
      partitionsConsumedConcurrently: Infinity,
      eachBatch: async ({
        batch,
        isRunning,
        isStale,
        heartbeat,
        resolveOffset,
        // commitOffsetsIfNecessary,
        // uncommittedOffsets,
      }) => {
        for (let message of batch.messages) {
          if (!isRunning() || isStale()) break;

          const km = new KafkaMessage(message.value.toString());

          await swimlaneBasedDispatcher.dispatch(km, batch.partition, handler);
          resolveOffset(message.offset);
          await heartbeat();
        }
      },
    });

    return async () => {
      await kc.disconnect();
      this.consumers.delete(kc);
    };
  }

  async close(): Promise<void> {
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }
}
