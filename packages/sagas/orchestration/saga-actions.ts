import type { CommandWithDestination } from '@nest-convoy/commands';
import type { Builder, RuntimeException } from '@nest-convoy/common';

import type { SagaExecutionState } from './saga-execution-state';

export class SagaActions<Data> {
  constructor(
    readonly commands: readonly CommandWithDestination[],
    readonly endState: boolean,
    readonly compensating: boolean,
    readonly local: boolean,
    readonly updatedSagaData?: Data,
    readonly updatedState?: SagaExecutionState,
    readonly localException?: RuntimeException,
  ) {}
}

export class SagaActionsBuilder<Data> implements Builder<SagaActions<Data>> {
  private commands: readonly CommandWithDestination[] = [];
  private compensating = false;
  private local = false;
  private endState = false;
  private updatedSagaData?: Data;
  private updatedState?: SagaExecutionState;
  private localException?: RuntimeException;

  withCommand(command: CommandWithDestination): this {
    this.commands = [...this.commands, command];
    return this;
  }

  withUpdatedState(state: SagaExecutionState): this {
    this.updatedState = state;
    return this;
  }

  withUpdatedSagaData(data: Data): this {
    this.updatedSagaData = data;
    return this;
  }

  withIsEndState(endState: boolean): this {
    this.endState = endState;
    return this;
  }

  withCommands(commands: readonly CommandWithDestination[]): this {
    this.commands = [...this.commands, ...commands];
    return this;
  }

  withIsCompensating(compensating: boolean): this {
    this.compensating = compensating;
    return this;
  }

  withIsLocal(localException?: RuntimeException): this {
    this.localException = localException;
    this.local = true;
    return this;
  }

  build(): SagaActions<Data> {
    return new SagaActions<Data>(
      this.commands,
      this.endState,
      this.compensating,
      this.local,
      this.updatedSagaData,
      this.updatedState,
      this.localException,
    );
  }
}
