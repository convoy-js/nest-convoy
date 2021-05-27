import { Embeddable, Property } from '@mikro-orm/core';

@Embeddable()
export class SagaExecutionState {
  static makeEndState(): SagaExecutionState {
    return new SagaExecutionState(-1, false, true);
  }

  @Property()
  compensating: boolean;

  @Property()
  endState: boolean;

  @Property()
  currentlyExecuting: number;

  constructor(currentlyExecuting = -1, compensating = false, endState = false) {
    this.currentlyExecuting = currentlyExecuting;
    this.compensating = compensating;
    this.endState = endState;
  }

  startCompensating(): SagaExecutionState {
    return new SagaExecutionState(this.currentlyExecuting, true);
  }

  nextState(size: number): SagaExecutionState {
    return new SagaExecutionState(
      this.compensating
        ? this.currentlyExecuting - size
        : this.currentlyExecuting + size,
      this.compensating,
    );
  }
}
