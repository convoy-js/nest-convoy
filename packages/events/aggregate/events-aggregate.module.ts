import { DynamicModule, Module, Type } from '@nestjs/common';

import { CommandProcessingAggregate } from './command-processing-aggregate';
import { AggregateStoreCrud } from './crud';
import {
  AGGREGATE_REPOSITORY_INTERCEPTOR,
  AggregateRepositoryInterceptor,
} from './aggregate-repository-interceptor';
import { Aggregates } from './aggregates';
import { AggregateSnapshotModule } from './snapshot';
import {
  getAggregateRepositoryToken,
  AggregateRepository,
} from './aggregate-repository';

@Module({
  imports: [AggregateSnapshotModule],
})
export class EventsAggregateModule {
  static forFeature(
    aggregates: readonly Type<CommandProcessingAggregate<any, any>>[],
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
      module: EventsAggregateModule,
      providers: [...aggregateRepositoryProviders],
    };
  }
}
