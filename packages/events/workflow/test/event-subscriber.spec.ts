import { EventSubscriber } from '../event-subscriber';
import { CommandProcessingAggregate } from '@nest-convoy/events/aggregate';
import { Entity } from 'typeorm';
import { OnEvent } from '@nest-convoy/core';

import { EventAggregate } from '../event-aggregate';
import { EventHandlerContext } from '../event-handler-context';

@Entity()
class Account extends CommandProcessingAggregate<any, any> {}

@EventAggregate(Account)
class AccountEvent {}

class AccountCreatedEvent extends AccountEvent {}

@EventSubscriber()
class AccountEventHandler {
  @OnEvent(AccountCreatedEvent)
  accountCreated(ctx: EventHandlerContext<AccountCreatedEvent>) {}
}
