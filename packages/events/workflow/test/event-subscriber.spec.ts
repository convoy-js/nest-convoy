import { Entity } from '@mikro-orm/core';

import { OnEvent, ProcessCommand } from '@nest-convoy/core';
import { CommandProcessingAggregate } from '@nest-convoy/events/aggregate';

import { EventAggregate } from '../../aggregate/event-aggregate';
import { EventHandlerContext } from '../event-handler-context';
import { EventSubscriber } from '../event-subscriber';

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
