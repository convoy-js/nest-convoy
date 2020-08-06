import { Injectable } from '@nestjs/common';
import { DispatcherFactory } from '@nest-convoy/core';
import { ConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import { ConvoyMessageProducer } from '@nest-convoy/messaging/producer';

import { CommandDispatcher } from './command-dispatcher';
import { CommandHandlers } from './command-handlers';

@Injectable()
export class CommandDispatcherFactory
  implements DispatcherFactory<CommandDispatcher, CommandHandlers> {
  constructor(
    private readonly messageConsumer: ConvoyMessageConsumer,
    private readonly messageProducer: ConvoyMessageProducer,
  ) {}

  create(
    commandDispatcherId: string,
    commandHandlers: CommandHandlers,
  ): CommandDispatcher {
    return new CommandDispatcher(
      commandDispatcherId,
      commandHandlers,
      this.messageConsumer,
      this.messageProducer,
    );
  }
}
