import { EventIdTypeAndData } from './interfaces';
import { SerializedSnapshotWithVersion } from './snapshot';

export class LoadedEvents {
  constructor(
    readonly events: EventIdTypeAndData<any>[],
    readonly snapshot?: SerializedSnapshotWithVersion<any>,
  ) {}
}
