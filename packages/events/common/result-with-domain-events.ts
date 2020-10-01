import { DomainEvent } from './domain-event';

export class ResultWithDomainEvents<A, E extends DomainEvent[] = any[]> {
  constructor(readonly result: A, readonly events: E) {}
}
