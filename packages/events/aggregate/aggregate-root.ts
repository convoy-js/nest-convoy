export abstract class AggregateRoot<T = Record<string, unknown>> {
  abstract id: string | number;

  constructor(values: Partial<T> = {}) {
    Object.assign(this, values);
  }

  applyEvent<E>(event: E): Promise<this> | this {
    return this;
  }
}
