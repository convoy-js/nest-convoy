export class SagaExecutionState {
  constructor(
    public currentlyExecuting = -1,
    public compensating = false,
    public endState = false,
  ) {}

  static makeEndState(): SagaExecutionState {
    return new SagaExecutionState(-1, false, true);
  }

  startCompensating(): SagaExecutionState {
    return new SagaExecutionState(this.currentlyExecuting, true);
  }

  nextState(size: number): SagaExecutionState {
    return new SagaExecutionState(
      !!this.compensating
        ? this.currentlyExecuting - size
        : this.currentlyExecuting + size,
      this.compensating,
    );
  }
}
