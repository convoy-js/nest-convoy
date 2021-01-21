import {
  CustomerCreated,
  CustomerServiceChannel,
} from '@ftgo-app/api/customer';

import {
  DomainEventEnvelope,
  DomainEventHandlers,
  OnEvent,
} from '@nest-convoy/core';

@DomainEventHandlers(CustomerServiceChannel.COMMAND)
export class AccountingEventsConsumer {
  constructor() {}

  @OnEvent(CustomerCreated)
  createAccount({ aggregateId }: DomainEventEnvelope<CustomerCreated>) {}
}
