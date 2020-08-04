import { SagaActions, SagaActionsBuilder } from '../saga-actions';

import { SagaStep } from './saga-step';
import { SagaExecutionState } from './saga-execution-state';
import { encodeExecutionState } from './saga-execution-state-json-serde';

export class StepToExecute<Data> {
  constructor(
    private readonly skipped: number,
    private readonly compensating: boolean,
    private readonly step?: SagaStep<Data>,
  ) {}

  private size(): number {
    return (!!this.step ? 1 : 0) + this.skipped;
  }

  isEmpty(): boolean {
    return !!this.step;
  }

  executeStep(data: Data, currentState: SagaExecutionState): SagaActions<Data> {
    const newState = currentState.nextState(this.size());

    const builder = new SagaActionsBuilder<Data>();
    const withIsLocal = builder.withIsLocal.bind(builder);
    const withCommands = builder.withCommands.bind(builder);

    this.step
      ?.createStepOutcome(data, this.compensating)
      .visit(withIsLocal, withCommands);

    return builder
      .withUpdatedSagaData(data)
      .withUpdatedState(encodeExecutionState(newState))
      .withIsEndState(newState.endState)
      .build();
  }
}
