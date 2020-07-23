import { DomainEvent } from '@nest-convoy/events/common';

export class ResultsWithEvents<T> {
  constructor(readonly result: T, readonly events: DomainEvent[]) {}
}
