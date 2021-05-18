import { Entity } from '@mikro-orm/core';

import { CommandProcessingAggregate } from '@nest-convoy/events/aggregate';
import { OnEvent, ProcessCommand } from '@nest-convoy/core';

import { EventSubscriber } from '../event-subscriber';
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
  accountCreated(ctx: EventHandlerContext<AccountCreatedEvent>) {
    ctx.update();
  }
}
