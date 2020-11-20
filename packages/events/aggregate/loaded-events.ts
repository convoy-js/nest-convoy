import { EventIdTypeAndData } from './interfaces';
import { SerializedSnapshotWithVersion } from './snapshot';

export class LoadedEvents {
  constructor(
    readonly events: readonly EventIdTypeAndData<any>[],
    readonly snapshot?: SerializedSnapshotWithVersion<any>,
  ) {}
}
