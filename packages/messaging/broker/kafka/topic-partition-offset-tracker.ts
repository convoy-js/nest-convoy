import { TopicPartitionOffsetAndMetadata } from 'kafkajs';

import { TopicPartitionOffsets } from './topic-partition-offsets';

export class TopicPartitionOffsetTracker {
  private readonly state = new Map<
    string,
    Map<number, TopicPartitionOffsets>
  >();

  private fetch(topic: string, partition: number): TopicPartitionOffsets {
    let tpo = this.getState(topic, partition);
    if (!tpo) {
      tpo = new TopicPartitionOffsets();
      this.putState(topic, partition, tpo);
    }

    return tpo;
  }

  private putState(
    topic: string,
    partition: number,
    tpo: TopicPartitionOffsets,
  ) {
    if (!this.state.has(topic)) {
      this.state.set(topic, new Map());
    }

    const topicMap = this.state.get(topic)!;
    topicMap.set(partition, tpo);
  }

  private getState(
    topic: string,
    partition: number,
  ): TopicPartitionOffsets | undefined {
    return this.state.get(topic)?.get(partition);
  }

  noteUnprocessed({
    topic,
    partition,
    offset,
  }: TopicPartitionOffsetAndMetadata): void {
    const tpo = this.fetch(topic, partition);
    tpo.noteUnprocessed(offset);
  }

  noteProcessed({
    topic,
    partition,
    offset,
  }: TopicPartitionOffsetAndMetadata): void {
    const tpo = this.fetch(topic, partition);
    tpo.noteProcessed(offset);
  }

  noteCommitted(tpos: readonly TopicPartitionOffsetAndMetadata[]): void {
    tpos.forEach(({ topic, partition, offset }) => {
      const tpo = this.fetch(topic, partition);
      tpo.noteCommitted(offset);
    });
  }

  // noteCommitted(offsets: Offsets): void {
  //   offsets.topics.forEach(({ topic, partitions }) => {
  //     partitions.forEach(({ offset, partition }) => {
  //       const tpo = this.fetch(topic, partition);
  //       tpo.noteCommitted(offset);
  //     });
  //   });
  // }

  toCommit(): TopicPartitionOffsetAndMetadata[] {
    return [...this.state.entries()].flatMap(([topic, partitions]) =>
      [...partitions.entries()]
        .map<[number, string | undefined]>(([partition, tpo]) => [
          partition,
          tpo.toCommit(),
        ])
        // .filter(([, offset]): offset is string => !!offset)
        .filter((value): value is [number, string] => !!value[0])
        .map(([partition, offset]) => ({
          topic,
          partition,
          offset,
        })),
    );
  }

  getPendingOffsets({
    topic,
    partition,
  }: TopicPartitionOffsetAndMetadata): readonly string[] {
    const tpo = this.fetch(topic, partition);
    return tpo.getPending();
  }

  // topicPartitionOffsetsToCommit(): Offsets {
  //   const topics = [...this.state.entries()].map(
  //     ([topic, partitions]): TopicOffsets => ({
  //       topic,
  //       partitions: [...partitions.entries()]
  //         .map<[number, string | undefined]>(([partition, tpo]) => [
  //           partition,
  //           tpo.toCommit(),
  //         ])
  //         // .filter(([, offset]): offset is string => !!offset)
  //         .filter((value): value is [number, string] => !!value[0])
  //         .map(
  //           ([partition, offset]): PartitionOffset => ({
  //             partition,
  //             offset,
  //           }),
  //         ),
  //     }),
  //   );
  //
  //   return { topics };
  // }
}
