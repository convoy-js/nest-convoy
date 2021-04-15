import { DynamicModule, Module, Type } from '@nestjs/common';

import { CommandProcessingAggregate } from './command-processing-aggregate';
import { AggregateCrudModule, AggregateStoreCrud } from './crud';
import {
  AGGREGATE_REPOSITORY_INTERCEPTOR,
  AggregateRepositoryInterceptor,
  DefaultAggregateRepositoryInterceptor,
} from './aggregate-repository-interceptor';
import { Aggregates } from './aggregates';
import { AggregateSnapshotModule } from './snapshot';
import {
  getAggregateRepositoryToken,
  AggregateRepository,
} from './aggregate-repository';
import {
  DefaultMissingApplyEventMethodStrategy,
  MISSING_APPLY_EVENT_METHOD_STRATEGY,
  MissingApplyEventMethodStrategy,
} from './missing-apply-event-method-strategy';

export interface EventsAggregatesModuleOptions {
  readonly aggregateRepositoryInterceptor?: Type<AggregateRepositoryInterceptor>;
  readonly missingApplyEventMethodStrategy?: Type<
    MissingApplyEventMethodStrategy<any>
  >;
}

@Module({
  imports: [AggregateSnapshotModule, AggregateCrudModule],
})
export class EventsAggregatesModule {
  static forFeature(
    aggregates: readonly Type<CommandProcessingAggregate<any, any>>[],
    options: EventsAggregatesModuleOptions = {},
  ): DynamicModule {
    const aggregateRepositoryProviders = aggregates.map(aggregate => ({
      provide: getAggregateRepositoryToken(aggregate),
      useFactory: (
        aggregates: Aggregates,
        aggregateStore: AggregateStoreCrud,
        interceptor: AggregateRepositoryInterceptor,
      ) =>
        new AggregateRepository(
          aggregate,
          aggregates,
          aggregateStore,
          interceptor,
        ),
      inject: [
        Aggregates,
        AggregateStoreCrud,
        AGGREGATE_REPOSITORY_INTERCEPTOR,
      ],
    }));

    return {
      module: EventsAggregatesModule,
      providers: [
        ...aggregateRepositoryProviders,
        {
          provide: AGGREGATE_REPOSITORY_INTERCEPTOR,
          useClass:
            options.aggregateRepositoryInterceptor ||
            DefaultAggregateRepositoryInterceptor,
        },
        {
          provide: MISSING_APPLY_EVENT_METHOD_STRATEGY,
          useClass:
            options.missingApplyEventMethodStrategy ||
            DefaultMissingApplyEventMethodStrategy,
        },
      ],
      exports: [
        AGGREGATE_REPOSITORY_INTERCEPTOR,
        MISSING_APPLY_EVENT_METHOD_STRATEGY,
        ...aggregateRepositoryProviders.map(({ provide }) => provide),
      ],
    };
  }
}
