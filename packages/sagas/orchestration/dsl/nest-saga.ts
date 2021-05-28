import type { Command } from '@nest-convoy/commands/common';
import { CommandWithDestinationBuilder } from '@nest-convoy/commands/consumer';

import { Saga } from '../saga';
import { NestSagaDefinitionBuilder } from './nest-saga-definition-builder';
import { StepBuilder } from './step-builder';

export abstract class NestSaga<Data> extends Saga<Data> {
  protected step(): StepBuilder<Data> {
    return new StepBuilder<Data>(new NestSagaDefinitionBuilder<Data>(this));
  }

  protected send<C extends Command>(
    command: C,
  ): CommandWithDestinationBuilder<C> {
    return new CommandWithDestinationBuilder<C>(command);
  }
}
