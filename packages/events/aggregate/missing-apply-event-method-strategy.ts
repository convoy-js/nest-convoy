import { AggregateRoot } from './aggregate-root';
import { MissingApplyMethodException } from './exceptions';

export class DefaultMissingApplyEventMethodStrategy<A extends AggregateRoot>
  implements MissingApplyEventMethodStrategy<A> {
  supports<E>(aggregate: A, error: MissingApplyMethodException<E>): boolean {
    return true;
  }

  handle<E>(aggregate: A, error: MissingApplyMethodException<E>): void {
    throw error;
  }
}

export class CompositeMissingApplyEventMethodStrategy<A extends AggregateRoot>
  implements MissingApplyEventMethodStrategy<A> {
  private readonly defaultStrategy = new DefaultMissingApplyEventMethodStrategy();

  constructor(
    private readonly strategies: MissingApplyEventMethodStrategy<A>[],
  ) {}

  supports<E>(aggregate: A, error: MissingApplyMethodException<E>): boolean {
    return this.strategies.some(s => s.supports(aggregate, error));
  }

  handle<E>(aggregate: A, error: MissingApplyMethodException<E>): void {
    const strategy = this.strategies.find(s => s.supports(aggregate, error));

    return strategy
      ? strategy.handle(aggregate, error)
      : this.defaultStrategy.handle(aggregate, error);
  }
}

export interface MissingApplyEventMethodStrategy<A extends AggregateRoot> {
  supports<E>(aggregate: A, error: MissingApplyMethodException<E>): boolean;
  handle<E>(aggregate: A, error: MissingApplyMethodException<E>): void;
}
