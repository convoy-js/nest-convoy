import { CommandWithDestinationBuilder } from '@nest-convoy/commands/consumer';
import { Command } from '@nest-convoy/commands/common';

import { Saga } from '../saga';
import { StepBuilder } from './step-builder';
import { NestSagaDefinitionBuilder } from './nest-saga-definition-builder';

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
