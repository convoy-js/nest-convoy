import { Builder, RuntimeException } from '@nest-convoy/common';
import { CommandWithDestination } from '@nest-convoy/commands';

export class SagaActions<Data> {
  constructor(
    readonly commands: readonly CommandWithDestination[],
    readonly endState: boolean,
    readonly compensating: boolean,
    readonly local: boolean,
    readonly updatedSagaData?: Data,
    readonly updatedState?: string,
    readonly localException?: RuntimeException,
  ) {}
}

export class SagaActionsBuilder<Data> implements Builder<SagaActions<Data>> {
  private readonly commands: CommandWithDestination[] = [];
  private compensating = false;
  private local = false;
  private endState = false;
  private updatedSagaData?: Data;
  private updatedState?: string;
  private localException?: RuntimeException;

  withCommand(command: CommandWithDestination): this {
    this.commands.push(command);
    return this;
  }

  withUpdatedState(state: string): this {
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
    this.commands.push(...commands);
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
