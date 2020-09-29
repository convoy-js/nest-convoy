import { Injectable, Type } from '@nestjs/common';

import { DomainEventPublisher } from '../publisher';
import { AggregateRoot } from './aggregate-root';

export interface AggregateDomainEventPublisher<A extends AggregateRoot> {
  publish<E>(aggregate: A, events: E[]): Promise<void>;
}

export function AggregateDomainEventPublisher<A extends AggregateRoot>(
  aggregateType: Type<A> | string,
): Type<AggregateDomainEventPublisher<A>> {
  const aggregateTypeName =
    typeof aggregateType === 'string' ? aggregateType : aggregateType.name;

  @Injectable()
  class AbstractAggregateDomainEventPublisher
    implements AggregateDomainEventPublisher<A> {
    constructor(
      private readonly domainEventPublisher: DomainEventPublisher, // private readonly _aggregateType: Type<A>, // private readonly idSupplier: AsyncLikeFn<[aggregate: A], string | number>,
    ) {}

    async publish<E>(aggregate: A, events: E[]): Promise<void> {
      // const id = await this.idSupplier(aggregate);
      await this.domainEventPublisher.publish(
        aggregateTypeName,
        aggregate.id,
        events,
      );
    }
  }

  return AbstractAggregateDomainEventPublisher;
}
