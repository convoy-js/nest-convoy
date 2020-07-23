import { DomainEvent } from '../common';

export class ResultsWithEvents<T> {
  constructor(readonly result: T, readonly events: DomainEvent[]) {}
}
