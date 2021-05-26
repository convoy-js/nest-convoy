import type {
  EachMessagePayload,
  TopicPartitionOffsetAndMetadata,
} from 'kafkajs';

import type { KafkaMessageHandler, KafkaMessage } from './kafka-message';
import { TopicPartitionOffsetTracker } from './topic-partition-offset-tracker';
import type { TopicPartitionOffset } from './topic-partition-offsets';

export class KafkaMessageProcessor {
  private readonly topicPartitionOffsetTracker =
    new TopicPartitionOffsetTracker();

  constructor(private handlers: readonly KafkaMessageHandler[] = []) {}

  addHandler(handler: KafkaMessageHandler): void {
    this.handlers = [...this.handlers, handler];
  }

  async process(
    message: KafkaMessage,
    payload: EachMessagePayload,
  ): Promise<TopicPartitionOffset> {
    const tpo: TopicPartitionOffset = {
      topic: payload.topic,
      offset: BigInt(payload.message.offset),
      partition: payload.partition,
    };
    this.topicPartitionOffsetTracker.noteUnprocessed(tpo);
    await Promise.all(this.handlers.map(handle => handle(message)));
    this.topicPartitionOffsetTracker.noteProcessed(tpo);
    return tpo;
  }

  noteOffsetsCommitted(tpo: readonly TopicPartitionOffset[]): void {
    this.topicPartitionOffsetTracker.noteCommitted(tpo);
  }

  serializeOffsetsToCommit(
    tpos: readonly TopicPartitionOffset[],
  ): TopicPartitionOffsetAndMetadata[] {
    return tpos.map(({ topic, offset, partition }) => ({
      topic,
      partition,
      offset: offset.toString(),
    }));
  }

  offsetsToCommit(): readonly TopicPartitionOffset[] {
    return this.topicPartitionOffsetTracker.offsetsToCommit();
  }

  // TODO
  // getPendingOffsets(): string {
  //   const this.topicPartitionOffsetTracker.toCommit();
  //   return this.topicPartitionOffsetTracker.getPendingOffsets();
  // }
}
