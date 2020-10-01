import {
  DomainEventEnvelope,
  DomainEventsConsumer,
  OnEvent,
} from '@nest-convoy/core';

import {
  CustomerCreated,
  CustomerServiceChannel,
} from '@ftgo-app/api/customer';

@DomainEventsConsumer(CustomerServiceChannel.COMMAND)
export class AccountingEventsConsumer {
  constructor() {}

  @OnEvent(CustomerCreated)
  createAccount({ aggregateId }: DomainEventEnvelope<CustomerCreated>) {}
}
