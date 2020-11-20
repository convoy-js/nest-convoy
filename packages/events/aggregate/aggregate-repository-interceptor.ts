import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { Injectable } from '@nestjs/common';

import { AggregateRoot } from './aggregate-root';
import { Snapshot } from './snapshot';
import { AggregateCrudUpdateOptions } from './crud';

export const AGGREGATE_REPOSITORY_INTERCEPTOR = Symbol(
  '__aggregateRepositoryInterceptor__',
);

export interface UpdateEventsAndOptions<
  AR extends AggregateRoot,
  S extends Snapshot,
  E extends readonly any[]
> {
  readonly events: E;
  readonly options?: AggregateCrudUpdateOptions<AR, S>;
}

export interface AggregateRepositoryInterceptor<
  // AR extends AggregateRoot,
  // S extends Snapshot
> {
  transformUpdate<
    AR extends AggregateRoot,
    S extends Snapshot,
    E extends readonly any[]
  >(
    aggregate: AR,
    ueo: UpdateEventsAndOptions<AR, S, E>,
  ): UpdateEventsAndOptions<AR, S, E>;
  handleException<
    AR extends AggregateRoot,
    S extends Snapshot,
    E extends readonly any[]
  >(
    aggregate: AR,
    error?: RuntimeException,
    options?: AggregateCrudUpdateOptions<AR, S>,
  ): UpdateEventsAndOptions<AR, S, E> | undefined;
}

@Injectable()
export class DefaultAggregateRepositoryInterceptor
  implements AggregateRepositoryInterceptor {
  handleException<
    AR extends AggregateRoot,
    S extends Snapshot,
    E extends readonly any[]
  >(
    aggregate: AR,
    error?: RuntimeException,
    options?: AggregateCrudUpdateOptions<AR, S>,
  ): UpdateEventsAndOptions<AR, S, E> | undefined {
    return undefined;
  }

  transformUpdate<
    AR extends AggregateRoot,
    S extends Snapshot,
    E extends readonly any[]
  >(
    aggregate: AR,
    ueo: UpdateEventsAndOptions<AR, S, E>,
  ): UpdateEventsAndOptions<AR, S, E> {
    return ueo;
  }
}
