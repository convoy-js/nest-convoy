export class TopicPartitionOffsets {
  private unprocessed: readonly string[] = [];
  private processed: readonly string[] = [];

  noteUnprocessed(offset: string): void {
    this.unprocessed = [...this.unprocessed, offset];
  }

  noteProcessed(offset: string): void {
    this.processed = [...this.processed, offset];
  }

  toCommit(): string | undefined {
    return this.unprocessed.find(x => !this.processed.includes(x));
  }

  noteCommitted(offset: string): void {
    this.unprocessed = this.unprocessed.filter(x => x >= offset);
    this.processed = this.processed.filter(x => x >= offset);
  }

  getPending(): readonly string[] {
    return this.unprocessed.filter(x => !this.processed.includes(x));
  }
}
