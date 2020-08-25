import { Injectable } from '@nestjs/common';
import { IEventBus } from '@nestjs/cqrs';

import { DomainEvent, DomainEventPublisher } from '@nest-convoy/events';

@Injectable()
export class EventBus implements IEventBus {
  constructor(private readonly domainEventPublisher: DomainEventPublisher) {}

  publish<T extends DomainEvent>(
    event: T,
    aggregateId?: string,
  ): Promise<void> {
    // @ts-ignore
    return this.domainEventPublisher.publish(undefined, aggregateId, [event]);
  }

  publishAll(events: DomainEvent[], aggregateId?: string): Promise<void> {
    // @ts-ignore
    return this.domainEventPublisher.publish(undefined, aggregateId, events);
  }
}
