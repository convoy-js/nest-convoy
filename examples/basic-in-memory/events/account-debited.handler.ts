import { EventsHandler, IEventHandler } from '@nest-convoy/cqrs';
import { DomainEventEnvelope } from '@nest-convoy/events';

import { AccountDebited } from './account-debited';

@EventsHandler(AccountDebited)
export class AccountDebitedHandler implements IEventHandler<AccountDebited> {
  handle(dee: DomainEventEnvelope<AccountDebited>): void {
    console.log(dee);
    /*
    const event = new AccountDebited(uniqueId);
    await this.domainEventPublisher.publish(EVENT_DISPATCHER_ID, [event]);
     */
    // console.log(event, message.getHeaders());
  }
}
