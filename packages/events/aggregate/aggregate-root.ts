import type { AsyncLike, ObjectLiteral } from '@nest-convoy/common';

export abstract class AggregateRoot<T = ObjectLiteral> {
  id?: string | number;
  version?: string | number;

  constructor(values: Partial<T> = {}) {
    Object.assign(this, values);
  }

  applyEvent?<E>(event: E): AsyncLike<this>;
}
