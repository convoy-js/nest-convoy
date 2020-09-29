import { Injectable, Type } from '@nestjs/common';
import { AggregateRoot } from '@nest-convoy/core';

import { DomainEvent } from '../common';
import { DomainEventPublisher } from '../publisher';

@Injectable()
export abstract class AggregateDomainEventPublisher<
  A extends AggregateRoot,
  E extends DomainEvent = any
> {
  get aggregateType(): string {
    return this._aggregateType.name;
  }

  protected constructor(
    private readonly eventPublisher: DomainEventPublisher,
    private readonly _aggregateType: Type<A>, // private readonly idSupplier: AsyncLikeFn<[aggregate: A], string | number>,
  ) {}

  async publish(aggregate: A, events: E[]): Promise<void> {
    // const id = await this.idSupplier(aggregate);
    await this.eventPublisher.publish(this.aggregateType, aggregate.id, events);
  }
}
