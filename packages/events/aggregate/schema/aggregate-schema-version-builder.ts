import { Builder, Type } from '@nest-convoy/common';

import { AggregateRoot } from '../aggregate-root';
import { AggregateSchemaBuilder } from './aggregate-schema-builder';
import {
  EventRename,
  EventTransform,
  EventUpcaster,
} from './aggregate-schema-version';

export class AggregateSchemaVersionBuilder<AR extends AggregateRoot>
  implements Builder<any>
{
  private renames: readonly EventRename[] = [];
  private transforms: readonly EventTransform[] = [];

  constructor(
    private readonly parent: AggregateSchemaBuilder<AR>,
    private readonly _version: number,
  ) {}

  finishForAggregate(): void {
    this.parent.addVersion(this._version, this.renames, this.transforms);
  }

  rename(oldEventType: Type, newEventType: Type): this {
    this.renames = [
      ...this.renames,
      new EventRename(oldEventType.name, newEventType),
    ];
    return this;
  }

  transform(eventType: Type, upcaster: EventUpcaster): this {
    this.transforms = [
      ...this.transforms,
      new EventTransform(eventType.name, upcaster),
    ];
    return this;
  }

  version(version: number): AggregateSchemaVersionBuilder<AR> {
    this.finishForAggregate();
    return this.parent.version(version);
  }

  customize(): void {
    this.finishForAggregate();
    this.parent.build();
  }

  forAggregate<AR extends AggregateRoot>(
    aggregateType: Type<AR>,
  ): AggregateSchemaBuilder<AR> {
    this.finishForAggregate();
    return this.parent.forAggregate(aggregateType);
  }

  build(): void {
    this.customize();
  }
}
