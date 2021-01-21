import {
  TopicPartitionOffset,
  TopicPartitionOffsets,
} from './topic-partition-offsets';

export class TopicPartitionOffsetTracker {
  // HINT: The index of TopicPartitionOffsets[] is the partition
  private readonly state = new Map<string, TopicPartitionOffsets[]>();

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
      this.state.set(topic, []);
    }
    this.state.get(topic)![partition] = tpo;
  }

  private getState(
    topic: string,
    partition: number,
  ): TopicPartitionOffsets | undefined {
    return this.state.get(topic)?.[partition];
  }

  noteUnprocessed({ topic, partition, offset }: TopicPartitionOffset): void {
    this.fetch(topic, partition).noteUnprocessed(offset);
  }

  noteProcessed({ topic, partition, offset }: TopicPartitionOffset): void {
    this.fetch(topic, partition).noteProcessed(offset);
  }

  noteCommitted(tpos: readonly TopicPartitionOffset[]): void {
    tpos.forEach(({ topic, partition, offset }) => {
      this.fetch(topic, partition).noteCommitted(offset);
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

  offsetsToCommit(): TopicPartitionOffset[] {
    return [...this.state.entries()].flatMap(([topic, partitions]) =>
      partitions
        .map<[number, bigint | undefined]>((tpo, partition) => [
          partition,
          tpo.toCommit(),
        ])
        .filter((value): value is [number, bigint] => value[1] != null)
        .map(([partition, offset]) => ({
          topic,
          partition,
          offset: offset + BigInt('1'),
        })),
    );
  }

  getPendingOffsets({
    topic,
    partition,
  }: TopicPartitionOffset): readonly bigint[] {
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
