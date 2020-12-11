import { AsyncLike } from '@nest-convoy/common';

export abstract class AggregateRoot<T = Record<string, unknown>> {
  abstract id: string | number;

  constructor(values: Partial<T> = {}) {
    Object.assign(this, values);
  }

  applyEvent<E>(event: E): AsyncLike<this> {
    return this;
  }
}
