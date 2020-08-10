import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { CommandBus } from '@nest-convoy/core';

import { DoSomethingCommand } from './do-something.command';

@Injectable()
export class TestCommandService implements OnApplicationBootstrap {
  constructor(private readonly commandBus: CommandBus) {}

  async onApplicationBootstrap(): Promise<void> {
    console.log(await this.commandBus.execute(new DoSomethingCommand()));
  }
}
