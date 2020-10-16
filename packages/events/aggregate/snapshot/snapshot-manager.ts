import { Injectable, OnModuleInit, Type } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { ModuleRef, ModulesContainer } from '@nestjs/core';

import { AggregateRoot } from '../aggregate-root';
import { EventWithMetadata } from '../event-with-metadata';
import { MissingApplyEventMethodStrategy } from '../missing-apply-event-method-strategy';
import {
  Snapshot,
  NestSnapshotStrategy,
  SNAPSHOT_STRATEGY_METADATA,
} from './snapshot-strategy';

@Injectable()
export class SnapshotManager implements OnModuleInit {
  private strategies: WeakMap<
    Type<AggregateRoot>,
    NestSnapshotStrategy<any, any>
  >;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly explorer: ExplorerService,
    private readonly modulesContainer: ModulesContainer,
  ) {}

  addStrategy(snapshot: NestSnapshotStrategy<any, any>): void {
    this.strategies.set(snapshot.aggregateType, snapshot);
  }

  possiblySnapshot<A extends AggregateRoot, S extends Snapshot>(
    aggregate: A,
    oldEvents: EventWithMetadata<any>[],
    newEvents: any[],
    version?: number,
  ): S | undefined {
    const strategy = this.strategies.get(aggregate.constructor as Type<A>);
    return strategy?.possibleSnapshot(aggregate, oldEvents, newEvents, version);
  }

  recreateFromSnapshot<A extends AggregateRoot, S extends Snapshot>(
    aggregateType: Type<A>,
    snapshot: S,
    missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<A>,
  ): A | undefined {
    const strategy = this.strategies.get(aggregateType);
    return strategy?.recreateAggregate(
      aggregateType,
      snapshot,
      missingApplyEventMethodStrategy,
    );
  }

  onModuleInit(): void {
    const modules = [...this.modulesContainer.values()];
    const snapshotStrategies = this.explorer
      .flatMap<NestSnapshotStrategy<any, any>>(modules, instance =>
        this.explorer.filterProvider(instance, SNAPSHOT_STRATEGY_METADATA),
      )
      .map<[Type<AggregateRoot>, NestSnapshotStrategy<any, any>]>(
        snapshotStrategy => [
          Reflect.getMetadata(
            SNAPSHOT_STRATEGY_METADATA,
            snapshotStrategy,
          ) as Type<AggregateRoot>,
          this.moduleRef.get<NestSnapshotStrategy<any, any>>(snapshotStrategy, {
            strict: false,
          }),
        ],
      );

    this.strategies = new WeakMap(snapshotStrategies);
  }
}
