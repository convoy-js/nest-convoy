import { Injectable } from '@nestjs/common';

import { AggregateRoot } from './aggregate-root';
import { MissingApplyMethodException } from './exceptions';

export const MISSING_APPLY_EVENT_METHOD_STRATEGY = Symbol(
  '__missingApplyEventMethodStrategy__',
);

@Injectable()
export class DefaultMissingApplyEventMethodStrategy<AR extends AggregateRoot>
  implements MissingApplyEventMethodStrategy<AR> {
  supports<E>(aggregate: AR, error: MissingApplyMethodException<E>): boolean {
    return true;
  }

  handle<E>(aggregate: AR, error: MissingApplyMethodException<E>): void {
    throw error;
  }
}

@Injectable()
export class CompositeMissingApplyEventMethodStrategy<AR extends AggregateRoot>
  implements MissingApplyEventMethodStrategy<AR> {
  private readonly defaultStrategy = new DefaultMissingApplyEventMethodStrategy();

  constructor(
    private readonly strategies: MissingApplyEventMethodStrategy<AR>[] = [],
  ) {}

  supports<E>(aggregate: AR, error: MissingApplyMethodException<E>): boolean {
    return this.strategies.some(s => s.supports(aggregate, error));
  }

  handle<E>(aggregate: AR, error: MissingApplyMethodException<E>): void {
    const strategy = this.strategies.find(s => s.supports(aggregate, error));

    return strategy
      ? strategy.handle(aggregate, error)
      : this.defaultStrategy.handle(aggregate, error);
  }
}

export interface MissingApplyEventMethodStrategy<AR extends AggregateRoot> {
  supports<E>(aggregate: AR, error: MissingApplyMethodException<E>): boolean;
  handle<E>(aggregate: AR, error: MissingApplyMethodException<E>): void;
}
