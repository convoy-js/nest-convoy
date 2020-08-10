import { CommandWithDestination } from '@nest-convoy/commands/consumer';
import { RuntimeException } from '@nest-convoy/common';

import { SagaActionsBuilder } from '../saga-actions';

export interface StepOutcome {
  visit<Data>(
    localConsumer: (
      localException?: RuntimeException,
    ) => SagaActionsBuilder<Data>,
    commandsConsumer: (
      commands: CommandWithDestination[],
    ) => SagaActionsBuilder<Data>,
  ): any;
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
  ): any {
    return localConsumer(this.localOutcome);
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
  ): any {
    return commandsConsumer(this.commandsToSend);
  }
}
