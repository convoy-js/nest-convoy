import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { Builder } from '@nest-convoy/core';
import { CommandWithDestination } from '@nest-convoy/commands/consumer';

export class SagaActions<Data> {
  constructor(
    readonly commands: CommandWithDestination[],
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
  private endState?: boolean;
  private compensating?: boolean;
  private local?: boolean;
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
    this.endState = true;
    return this;
  }

  withCommands(commands: CommandWithDestination[]): this {
    this.commands.push(...commands);
    return this;
  }

  withIsCompensating(compensating: boolean): this {
    this.compensating = true;
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
