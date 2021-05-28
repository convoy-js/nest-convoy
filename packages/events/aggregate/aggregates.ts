import { plainToClass } from '@deepkit/type';
import { MikroORM } from '@mikro-orm/core';
import type { Type } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';

import type { AggregateRoot } from './aggregate-root';
import { MissingApplyMethodException } from './exceptions';
import {
  MISSING_APPLY_EVENT_METHOD_STRATEGY,
  MissingApplyEventMethodStrategy,
} from './missing-apply-event-method-strategy';

@Injectable()
export class Aggregates {
  constructor(
    private readonly orm: MikroORM,
    @Inject(MISSING_APPLY_EVENT_METHOD_STRATEGY)
    private readonly missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<any>,
  ) {}

  // AR should be CommandProcessingAggregate
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

  recreateAggregate<AR extends AggregateRoot, E extends readonly any[]>(
    aggregateType: Type<AR>,
    events: E,
    // missingApplyEventMethodStrategy: MissingApplyEventMethodStrategy<AR>,
  ): Promise<AR> {
    return this.applyEvents(
      this.orm.em.create(aggregateType, {}),
      // plainToClass<Type<AR>>(aggregateType, {}),
      events,
      // missingApplyEventMethodStrategy,
    );
  }
}
