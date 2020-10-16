import { Type } from '@nestjs/common';

import { AggregateRoot } from '../aggregate-root';
import { EventWithMetadata } from '../event-with-metadata';
import { MissingApplyEventMethodStrategy } from '../missing-apply-event-method-strategy';

export interface Snapshot {}

export const SNAPSHOT_STRATEGY_METADATA = '__snapshotStrategy__';

export function SnapshotStrategy<A extends AggregateRoot, S extends Snapshot>(
  aggregate: Type<A>,
) {
  return (target: Type<NestSnapshotStrategy<A, S>>): void => {
    Reflect.defineMetadata(SNAPSHOT_STRATEGY_METADATA, aggregate, target);
  };
}

export interface NestSnapshotStrategy<
  A extends AggregateRoot,
  S extends Snapshot
> {
  readonly aggregateType: A;

  possibleSnapshot<SA extends S>(
    aggregate: A,
    oldEvents: EventWithMetadata<any>[],
    newEvents: any[],
    version?: number,
  ): SA | undefined;
  recreateAggregate<SA extends S>(
    aggregateType: Type<A>,
    snapshot: Snapshot,
    missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<A>,
  ): SA | undefined;
}
