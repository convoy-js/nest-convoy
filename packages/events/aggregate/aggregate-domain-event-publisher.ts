import { Injectable, Type } from '@nestjs/common';

import { DomainEvent } from '@nest-convoy/events/common';

import { DomainEventPublisher } from '../publisher';
import { AggregateRoot } from './aggregate-root';

export interface AggregateDomainEventPublisher<AR extends AggregateRoot> {
  publish<E extends readonly DomainEvent[]>(
    aggregate: AR,
    events: E,
  ): Promise<void>;
}

export function AggregateDomainEventPublisher<AR extends AggregateRoot>(
  aggregateType: Type<AR> | string,
): Type<AggregateDomainEventPublisher<AR>> {
  const aggregateTypeName =
    typeof aggregateType === 'string' ? aggregateType : aggregateType.name;

  @Injectable()
  class AbstractAggregateDomainEventPublisher
    implements AggregateDomainEventPublisher<AR> {
    constructor(private readonly domainEventPublisher: DomainEventPublisher) {}

    async publish<E extends readonly DomainEvent[]>(
      aggregate: AR,
      events: E,
    ): Promise<void> {
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
