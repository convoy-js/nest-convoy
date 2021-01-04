import { Inject, Injectable, OnModuleInit, Type } from '@nestjs/common';
import { ExplorerService } from '@nestjs/cqrs/dist/services/explorer.service';
import { ModuleRef, ModulesContainer } from '@nestjs/core';

import { AggregateRoot } from '../aggregate-root';
import { EventWithMetadata } from '../interfaces';
import {
  MISSING_APPLY_EVENT_METHOD_STRATEGY,
  MissingApplyEventMethodStrategy,
} from '../missing-apply-event-method-strategy';
import {
  Snapshot,
  NestSnapshotStrategy,
  SNAPSHOT_STRATEGY_METADATA,
} from './snapshot-strategy';

@Injectable()
export class SnapshotManager implements OnModuleInit {
  private store: Map<
    string,
    { snapshot: Type<Snapshot>; strategy: NestSnapshotStrategy<any, any> }
  >;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly explorer: ExplorerService,
    private readonly modulesContainer: ModulesContainer,
    @Inject(MISSING_APPLY_EVENT_METHOD_STRATEGY)
    private readonly missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<any>,
  ) {}

  // addStrategy(snapshot: NestSnapshotStrategy<any, any>): void {
  //   this.strategies.set(snapshot.aggregateType, snapshot);
  // }

  getSnapshots(): readonly Type<Snapshot>[] {
    return [...this.store.values()].map(({ snapshot }) => snapshot);
  }

  possiblySnapshot<AR extends AggregateRoot, S extends Snapshot>(
    aggregate: AR,
    oldEvents: readonly EventWithMetadata<any>[],
    newEvents: readonly any[],
    version?: string,
  ): S | undefined {
    const data = this.store.get(aggregate.constructor.name);
    return data?.strategy.possibleSnapshot(
      aggregate,
      oldEvents,
      newEvents,
      version,
    );
  }

  async recreateFromSnapshot<AR extends AggregateRoot, S extends Snapshot>(
    aggregateType: Type<AR>,
    snapshot: S,
    // missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<AR>,
  ): Promise<AR | undefined> {
    const data = this.store.get(aggregateType.name);
    return data?.strategy.recreateAggregate(
      aggregateType,
      snapshot,
      this.missingApplyEventMethodStrategy,
    );
  }

  onModuleInit(): void {
    const modules = [...this.modulesContainer.values()];
    const snapshotStrategies = this.explorer
      .flatMap<NestSnapshotStrategy<any, any>>(modules, instance =>
        this.explorer.filterProvider(instance, SNAPSHOT_STRATEGY_METADATA),
      )
      .map<
        [
          string,
          {
            snapshot: Type<Snapshot>;
            strategy: NestSnapshotStrategy<any, any>;
          },
        ]
      >(snapshotStrategy => {
        const { aggregate, snapshot } = Reflect.getMetadata(
          SNAPSHOT_STRATEGY_METADATA,
          snapshotStrategy,
        );
        const strategy = this.moduleRef.get<NestSnapshotStrategy<any, any>>(
          snapshotStrategy,
          {
            strict: false,
          },
        );
        return [aggregate.name, { snapshot, strategy }];
      });

    this.store = new Map(snapshotStrategies);
  }
}
