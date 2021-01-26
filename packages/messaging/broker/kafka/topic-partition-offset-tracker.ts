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
    return this.fetch(topic, partition).getPending();
  }
}
