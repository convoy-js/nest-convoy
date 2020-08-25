import {
  CommandHandler,
  ICommandHandler,
  CommandMessage,
  DomainEventPublisher,
} from '@nest-convoy/core';

import { DoSomethingCommand } from './do-something.command';
import { AccountDebited } from '../events/account-debited';
import { uniqueId } from './tokens';

@CommandHandler(DoSomethingCommand)
export class DoSomethingCommandHandler
  implements ICommandHandler<DoSomethingCommand> {
  constructor(private readonly domainEventPublisher: DomainEventPublisher) {}

  async execute({
    command,
  }: CommandMessage<DoSomethingCommand>): Promise<void> {
    const event = new AccountDebited(uniqueId);
    await this.domainEventPublisher.publish(
      AccountDebited.name,
      `${uniqueId}`,
      [event],
    );
  }
}
