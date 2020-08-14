import { DomainEventHandlers } from '@nest-convoy/events';

export class TestDomainEventHandler {
  async eventHandlers(domainEventHandlers: DomainEventHandlers): Promise<this> {
    return this;
  }
}
