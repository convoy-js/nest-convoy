import { Injectable, Type } from '@nestjs/common';

import { RuntimeException } from '@nest-convoy/common';
import { DomainEvent } from '@nest-convoy/events/common';

import { DomainEventPublisher } from '../publisher';
import { AggregateRoot } from './aggregate-root';
import { AggregateId, getAggregateId } from './decorators';

export interface AggregateDomainEventPublisher<AR extends AggregateRoot> {
  publish<E extends readonly DomainEvent[]>(
    aggregate: AR,
    events: E,
  ): Promise<void>;
}

export function AggregateDomainEventPublisher<AR extends AggregateRoot>(
  aggregateType: Type<AR>,
): Type<AggregateDomainEventPublisher<AR>> {
  @Injectable()
  class AbstractAggregateDomainEventPublisher
    implements AggregateDomainEventPublisher<AR>
  {
    constructor(private readonly domainEventPublisher: DomainEventPublisher) {}

    async publish<E extends readonly DomainEvent[]>(
      aggregate: AR,
      events: E,
    ): Promise<void> {
      const id = getAggregateId(aggregate);
      if (!id) {
        throw new RuntimeException(`Missing @${AggregateId.name}()`);
      }
      await this.domainEventPublisher.publish(aggregateType.name, id, events);
    }
  }

  return AbstractAggregateDomainEventPublisher;
}
