import { AggregateRoot as AR } from '@nestjs/cqrs';

export abstract class AggregateRoot<T> extends AR {
  abstract id: string | number;

  constructor(values: Partial<T>) {
    super();
    Object.assign(this, values);
  }

  abstract applyEvent<E>(event: E): this;
}
