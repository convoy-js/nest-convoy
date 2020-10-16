import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Type } from '@nestjs/common';

import {
  SnapshotsEntity,
  EventsEntity,
  EntitiesEntity,
} from '@nest-convoy/events/common';

import { AggregateRoot } from './aggregate-root';
import { EventIdTypeAndData, EventTypeAndData } from './event-with-metadata';

import { AggregateCrudSaveOptions } from './crud/aggregate-crud-save-options';

let idCounter = 0;

export class Test {
  constructor(
    @InjectRepository(SnapshotsEntity)
    private readonly snapshots: Repository<SnapshotsEntity>,
    @InjectRepository(EntitiesEntity)
    private readonly entities: Repository<EntitiesEntity>,
    @InjectRepository(EventsEntity)
    private readonly events: Repository<EventsEntity<any>>,
  ) {}

  private toEventId<E>(
    eventTypeAndData: EventTypeAndData<E>,
  ): EventIdTypeAndData<E> {
    return new EventIdTypeAndData(++idCounter, eventTypeAndData);
  }

  async save<A extends AggregateRoot>(
    aggregateType: Type<A>,
    events: EventTypeAndData<any>[],
    saveOptions?: AggregateCrudSaveOptions,
  ): Promise<any> {
    // const eventsWithIds =
  }
}
