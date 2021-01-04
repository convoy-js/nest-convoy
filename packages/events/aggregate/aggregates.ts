import { Inject, Injectable, Type } from '@nestjs/common';

import { AggregateRoot } from './aggregate-root';
import {
  MISSING_APPLY_EVENT_METHOD_STRATEGY,
  MissingApplyEventMethodStrategy,
} from './missing-apply-event-method-strategy';
import { MissingApplyMethodException } from './exceptions';

@Injectable()
export class Aggregates {
  constructor(
    @Inject(MISSING_APPLY_EVENT_METHOD_STRATEGY)
    private readonly missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<any>,
  ) {}

  async applyEvents<AR extends AggregateRoot, E extends readonly any[]>(
    aggregate: AR,
    events: E,
    // missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<AR>,
  ): Promise<AR> {
    for (const event of events) {
      try {
        if (typeof aggregate.applyEvent !== 'function') {
          throw new MissingApplyMethodException(event);
        }
        aggregate = await aggregate.applyEvent(event);
      } catch (err) {
        if (err instanceof MissingApplyMethodException) {
          await this.missingApplyEventMethodStrategy.handle(aggregate, err);
        }
      }
    }

    return aggregate;
  }

  recreateAggregate<AR extends AggregateRoot, E extends readonly object[]>(
    aggregateType: Type<AR>,
    events: E,
    // missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<AR>,
  ): Promise<AR> {
    return this.applyEvents(
      new aggregateType(),
      events,
      // missingApplyEventMethodStrategy,
    );
  }
}
