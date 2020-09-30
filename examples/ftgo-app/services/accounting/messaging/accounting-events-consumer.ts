import { DomainEventsConsumer, OnEvent } from '@nest-convoy/core';

@DomainEventsConsumer('Consumer')
export class AccountingEventsConsumer {
  @OnEvent()
}
