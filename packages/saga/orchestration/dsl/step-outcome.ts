import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { RuntimeException } from '@nest-convoy/core';

import { SagaActionsBuilder } from '../saga-actions';

export interface StepOutcome {
  visit<Data>(
    localConsumer: (
      localException?: RuntimeException,
    ) => SagaActionsBuilder<Data>,
    commandsConsumer: (
      commands: CommandWithDestination[],
    ) => SagaActionsBuilder<Data>,
  ): void;
}

export class LocalStepOutcome implements StepOutcome {
  constructor(private readonly localOutcome?: RuntimeException) {}

  visit<Data>(
    localConsumer: (
      localException?: RuntimeException,
    ) => SagaActionsBuilder<Data>,
    commandsConsumer: (
      commands: CommandWithDestination[],
    ) => SagaActionsBuilder<Data>,
  ): void {
    localConsumer(this.localOutcome);
  }
}

export class RemoteStepOutcome implements StepOutcome {
  constructor(private readonly commandsToSend: CommandWithDestination[]) {}

  visit<Data>(
    localConsumer: (
      localException?: RuntimeException,
    ) => SagaActionsBuilder<Data>,
    commandsConsumer: (
      commands: CommandWithDestination[],
    ) => SagaActionsBuilder<Data>,
  ): void {
    commandsConsumer(this.commandsToSend);
  }
}