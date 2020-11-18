import { SerializedSnapshot } from './serialized-snapshot';
import { Snapshot } from './snapshot-strategy';

export class SerializedSnapshotWithVersion<S extends Snapshot> {
  constructor(
    readonly serializedSnapshot: SerializedSnapshot<S>,
    readonly entityVersion: string,
  ) {}
}
