import { Injectable, Type } from '@nestjs/common';

import { AggregateRoot } from '../aggregate-root';

import { AggregateSchemaBuilder } from './aggregate-schema-builder';
import { AggregateSchemaVersion } from './aggregate-schema-version';
import { AggregateSchema } from './aggregate-schema';
import { DefaultEventSchemaManager } from './event-schema-manager';

@Injectable()
export class ConfigurableEventSchema {
  constructor(private readonly eventSchemaManager: DefaultEventSchemaManager) {}

  forAggregate<AR extends AggregateRoot>(
    aggregateType: Type<AR>,
  ): AggregateSchemaBuilder<AR> {
    return new AggregateSchemaBuilder(this, aggregateType);
  }

  finishForAggregate<AR extends AggregateRoot>(
    aggregateType: Type<AR>,
    versions: readonly AggregateSchemaVersion[],
  ): void {
    this.eventSchemaManager.add(new AggregateSchema(aggregateType, versions));
  }

  finishForAggregateAndStartNew<AR extends AggregateRoot>(
    aggregateType: Type,
    versions: readonly AggregateSchemaVersion[],
    nextAggregateType: Type<AR>,
  ): AggregateSchemaBuilder<AR> {
    this.finishForAggregate(aggregateType, versions);
    return new AggregateSchemaBuilder(this, nextAggregateType);
  }
}
