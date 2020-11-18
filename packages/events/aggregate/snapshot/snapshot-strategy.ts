import { Injectable, Type } from '@nestjs/common';

import { AggregateRoot } from '../aggregate-root';
import { EventWithMetadata } from '../interfaces';
import { MissingApplyEventMethodStrategy } from '../missing-apply-event-method-strategy';

export interface Snapshot {}

export const SNAPSHOT_STRATEGY_METADATA = '__snapshotStrategy__';

export function SnapshotStrategy<AR extends AggregateRoot, S extends Snapshot>(
  aggregate: Type<AR>,
  snapshot: Type<S>,
) {
  return (target: Type<NestSnapshotStrategy<AR, S>>): void => {
    Reflect.defineMetadata(
      SNAPSHOT_STRATEGY_METADATA,
      { aggregate, snapshot },
      target,
    );
    Injectable()(target);
  };
}

export interface NestSnapshotStrategy<
  AR extends AggregateRoot,
  S extends Snapshot
> {
  possibleSnapshot(
    aggregate: AR,
    oldEvents: readonly EventWithMetadata<any>[],
    newEvents: readonly any[],
    version?: string,
  ): S | undefined;
  recreateAggregate(
    aggregateType: Type<AR>,
    snapshot: S,
    missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<AR>,
  ): Promise<AR>;
}
