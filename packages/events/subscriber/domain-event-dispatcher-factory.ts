import { Injectable } from '@nestjs/common';
import { DispatcherFactory } from '@nest-convoy/core';
import { ConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';

import { DomainEventHandlers } from './domain-event-handlers';
import { DomainEventDispatcher } from './domain-event-dispatcher';

@Injectable()
export class DomainEventDispatcherFactory
  implements DispatcherFactory<DomainEventDispatcher, DomainEventHandlers> {
  constructor(private readonly messageConsumer: ConvoyMessageConsumer) {}

  create(
    eventDispatcherId: string,
    domainEventHandlers: DomainEventHandlers,
  ): DomainEventDispatcher {
    return new DomainEventDispatcher(
      eventDispatcherId,
      domainEventHandlers,
      this.messageConsumer,
    );
  }
}
