import { SerializedSnapshotWithVersion } from './serialized-snapshot-with-version';
import { Snapshot } from './snapshot-strategy';

export class LoadedSnapshot<S extends Snapshot> {
  constructor(
    readonly serializedSnapshot: SerializedSnapshotWithVersion<S>,
    readonly triggeringEvents?: string,
  ) {}
}
