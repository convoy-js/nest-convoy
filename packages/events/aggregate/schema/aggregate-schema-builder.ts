import { Builder, Type } from '@nest-convoy/common';

import { AggregateRoot } from '../aggregate-root';
import { ConfigurableEventSchema } from './configurable-event-schema';
import { AggregateSchemaVersionBuilder } from './aggregate-schema-version-builder';
import {
  AggregateSchemaVersion,
  EventRename,
  EventTransform,
} from './aggregate-schema-version';

export class AggregateSchemaBuilder<AR extends AggregateRoot>
  implements Builder<void>
{
  private versions: readonly AggregateSchemaVersion[] = [];

  constructor(
    private readonly configurable: ConfigurableEventSchema,
    private readonly aggregateType: Type<AR>,
  ) {}

  addVersion(
    version: number,
    renames: readonly EventRename[],
    transforms: readonly EventTransform[],
  ): void {
    this.versions = [
      ...this.versions,
      new AggregateSchemaVersion(version, renames, transforms),
    ];
  }

  version(value: number): AggregateSchemaVersionBuilder<AR> {
    return new AggregateSchemaVersionBuilder(this, value);
  }

  forAggregate<AR extends AggregateRoot>(
    aggregateType: Type<AR>,
  ): AggregateSchemaBuilder<AR> {
    return this.configurable.finishForAggregateAndStartNew(
      this.aggregateType,
      this.versions,
      aggregateType,
    );
  }

  build(): void {
    return this.configurable.finishForAggregate(
      this.aggregateType,
      this.versions,
    );
  }
}
