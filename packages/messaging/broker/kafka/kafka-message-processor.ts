import { TopicPartitionOffsetAndMetadata } from 'kafkajs';

import { Message, MessageHandler } from '@nest-convoy/messaging';

import { TopicPartitionOffsetTracker } from './topic-partition-offset-tracker';

export class KafkaMessageProcessor {
  private readonly topicPartitionOffsetTracker = new TopicPartitionOffsetTracker();

  constructor(private handlers: readonly MessageHandler[] = []) {}

  addHandler(handler: MessageHandler): void {
    this.handlers = [...this.handlers, handler];
  }

  async process(
    message: Message,
    tpo: TopicPartitionOffsetAndMetadata,
  ): Promise<TopicPartitionOffsetAndMetadata> {
    this.topicPartitionOffsetTracker.noteUnprocessed(tpo);
    await Promise.all(this.handlers.map(handle => handle(message)));
    this.topicPartitionOffsetTracker.noteProcessed(tpo);
    return tpo;
  }

  noteTopicPartitionOffsetsCommitted(
    tpo: TopicPartitionOffsetAndMetadata[],
  ): void {
    this.topicPartitionOffsetTracker.noteCommitted(tpo);
  }

  topicPartitionOffsetsToCommit(): TopicPartitionOffsetAndMetadata[] {
    return this.topicPartitionOffsetTracker.toCommit();
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
