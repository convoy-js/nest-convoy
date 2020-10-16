import { Injectable, Type } from '@nestjs/common';

import { AggregateRoot } from './aggregate-root';
import { MissingApplyEventMethodStrategy } from './missing-apply-event-method-strategy';
import { MissingApplyMethodException } from './exceptions';

@Injectable()
export class Aggregates {
  async applyEventsToMutableAggregate<
    A extends AggregateRoot,
    E extends object[]
  >(
    aggregate: A,
    events: E,
    missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<A>,
  ): Promise<A> {
    for (const event of events) {
      try {
        aggregate = await aggregate.applyEvent(event);
      } catch (err) {
        if (err instanceof MissingApplyMethodException) {
          await missingApplyEventMethodStrategy.handle(aggregate, err);
        }
      }
    }

    return aggregate;
  }

  recreateAggregate<A extends AggregateRoot, E extends object[]>(
    aggregateType: Type<A>,
    events: E,
    missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<A>,
  ): Promise<A> {
    return this.applyEventsToMutableAggregate(
      new aggregateType(),
      events,
      missingApplyEventMethodStrategy,
    );
  }
}
