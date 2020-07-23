import { Injectable } from '@nestjs/common';
import { MessageConsumer } from '@nest-convoy/messaging/consumer';

import { DomainEventNameMapping } from '../common';
import { DomainEventHandlers } from './domain-event-handlers';
import { DomainEventDispatcher } from './domain-event-dispatcher';

@Injectable()
export class DomainEventDispatcherFactory {
  constructor(
    private readonly messageConsumer: MessageConsumer,
    private readonly domainEventNameMapping: DomainEventNameMapping,
  ) {}

  create(
    eventDispatcherId: string,
    domainEventHandlers: DomainEventHandlers,
  ): DomainEventDispatcher {
    return new DomainEventDispatcher(
      eventDispatcherId,
      domainEventHandlers,
      this.messageConsumer,
      this.domainEventNameMapping,
    );
  }
}
