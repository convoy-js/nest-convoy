export class SagaExecutionState {
  static makeEndState(): SagaExecutionState {
    return new SagaExecutionState(-1, false, true);
  }

  constructor(
    readonly currentlyExecuting = -1,
    readonly compensating = false,
    readonly endState = false,
  ) {}

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
