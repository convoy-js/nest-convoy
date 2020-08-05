import { Injectable } from '@nestjs/common';
import { DispatcherFactory } from '@nest-convoy/core';
import { NestConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import { NestConvoyMessageProducer } from '@nest-convoy/messaging/producer';

import { CommandDispatcher } from './command-dispatcher';
import { CommandHandlers } from './command-handlers';

@Injectable()
export class CommandDispatcherFactory
  implements DispatcherFactory<CommandDispatcher, CommandHandlers> {
  constructor(
    private readonly messageConsumer: NestConvoyMessageConsumer,
    private readonly messageProducer: NestConvoyMessageProducer,
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
