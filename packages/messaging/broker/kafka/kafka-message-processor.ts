import { EachMessagePayload, TopicPartitionOffsetAndMetadata } from 'kafkajs';

import { Message, MessageHandler } from '@nest-convoy/messaging';

import { TopicPartitionOffsetTracker } from './topic-partition-offset-tracker';
import { TopicPartitionOffset } from './topic-partition-offsets';

export class KafkaMessageProcessor {
  private readonly topicPartitionOffsetTracker = new TopicPartitionOffsetTracker();

  constructor(private handlers: readonly MessageHandler[] = []) {}

  addHandler(handler: MessageHandler): void {
    this.handlers = [...this.handlers, handler];
  }

  async process(
    message: Message,
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
    // const offsets = this.offsetTracker.toCommit();
    // return offsets.topics.flatMap(({ topic, partitions }) =>
    //   partitions.map(({ partition, offset }) => ({
    //     topic,
    //     partition,
    //     offset,
    //   })),
    // );
  }

  // TODO
  // getPendingOffsets(): string {
  //   const this.topicPartitionOffsetTracker.toCommit();
  //   return this.topicPartitionOffsetTracker.getPendingOffsets();
  // }
}
