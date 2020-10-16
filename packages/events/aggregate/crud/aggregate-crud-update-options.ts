import { EventContext } from '../event-context';

import { SerializedSnapshot } from './serialized-snapshot';

export class AggregateCrudUpdateOptions<S> {
  constructor(
    readonly triggeringEvent?: EventContext,
    readonly snapshot?: SerializedSnapshot<S>,
  ) {}

  withSnapshot(snapshot: SerializedSnapshot<S>): AggregateCrudUpdateOptions<S> {
    return new AggregateCrudUpdateOptions(this.triggeringEvent, snapshot);
  }

  withTriggeringEvent(
    triggeringEvent: EventContext,
  ): AggregateCrudUpdateOptions<S> {
    return new AggregateCrudUpdateOptions(triggeringEvent, this.snapshot);
  }
}
