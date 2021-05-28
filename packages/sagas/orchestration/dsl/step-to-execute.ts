import { SagaActionsBuilder } from '../saga-actions';
import type { SagaActions } from '../saga-actions';
import type { SagaExecutionState } from '../saga-execution-state';
import type { SagaStep } from './saga-step';

export class StepToExecute<Data> {
  constructor(
    private readonly skipped: number,
    private readonly compensating: boolean,
    private readonly step?: SagaStep<Data>,
  ) {}

  private size(): number {
    return (!this.isEmpty() ? 1 : 0) + this.skipped;
  }

  isEmpty(): boolean {
    return !this.step;
  }

  async executeStep(
    data: Data,
    currentState: SagaExecutionState,
  ): Promise<SagaActions<Data>> {
    const newState = currentState.nextState(this.size());

    const builder = new SagaActionsBuilder<Data>();
    const withIsLocal = builder.withIsLocal.bind(builder);
    const withCommands = builder.withCommands.bind(builder);

    (await this.step?.createStepOutcome(data, this.compensating))?.visit(
      withIsLocal,
      withCommands,
    );

    return builder
      .withUpdatedSagaData(data)
      .withUpdatedState(newState)
      .withIsEndState(newState.endState)
      .withIsCompensating(currentState.compensating)
      .build();
  }
}
