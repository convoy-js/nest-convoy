import { Injectable } from '@nestjs/common';

import { DispatcherFactory } from '@nest-convoy/common';
import { ConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import { ConvoyMessageProducer } from '@nest-convoy/messaging/producer';

import { ConvoyCommandDispatcher } from './command-dispatcher';
import { CommandHandlers } from './command-handlers';

@Injectable()
export class CommandDispatcherFactory
  implements DispatcherFactory<ConvoyCommandDispatcher, CommandHandlers> {
  constructor(
    private readonly messageConsumer: ConvoyMessageConsumer,
    private readonly messageProducer: ConvoyMessageProducer,
  ) {}

  create(
    commandDispatcherId: string,
    commandHandlers: CommandHandlers,
  ): ConvoyCommandDispatcher {
    return new ConvoyCommandDispatcher(
      commandDispatcherId,
      commandHandlers,
      this.messageConsumer,
      this.messageProducer,
    );
  }
}
