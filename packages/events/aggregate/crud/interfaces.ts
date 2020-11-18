import { EventContext } from '../event-context';
import { SerializedSnapshot, Snapshot } from '../snapshot';
import { EntityIdAndVersion, EventWithMetadata } from '../interfaces';
import { AggregateRoot } from '../aggregate-root';
import { AggregateRepositoryInterceptor } from '../aggregate-repository-interceptor';

export interface AggregateCrudFindOptions {
  readonly triggeringEvent?: EventContext;
}

export interface AggregateCrudSaveOptions {
  readonly eventMetadata?: Record<string, string>;
  readonly triggeringEvent?: EventContext;
  readonly entityId?: string;
}

export interface AggregateCrudUpdateOptions<
  AR extends AggregateRoot,
  S extends Snapshot
> extends Omit<AggregateCrudSaveOptions, 'entityId'> {
  // readonly snapshot?: SerializedSnapshot<S>;
  readonly snapshot?: S;
  readonly interceptor?: AggregateRepositoryInterceptor;
}

export interface EntityWithMetadata<AR extends AggregateRoot>
  extends EntityIdAndVersion {
  readonly snapshotVersion?: string;
  readonly events: readonly EventWithMetadata<any>[];
  readonly entity: AR;
}
