export interface DecodedEtopContext {
  readonly id: string;
  readonly topic: string;
  readonly partition: number;
  readonly offset: number;
}

export class SnapshotTriggeringEvents {
  constructor(
    readonly topicsToPartitionsAndOffsets: Map<string, Map<number, number>>,
  ) {}

  checkForDuplicateEvent(etop: DecodedEtopContext): void {
    const pos = this.topicsToPartitionsAndOffsets.get(etop.topic);
    const maxOffset = pos?.get(etop.partition);
    if (!maxOffset) return;

    if (etop.offset <= maxOffset) {
      throw new Error('DuplicateTriggeringEventException');
    }
  }
}
