import { AggregateStoreCrud } from '@nest-convoy/events/aggregate/crud';
import { ModuleRef } from '@nestjs/core';
import { Type } from '@nestjs/common';
import {
  AggregateRepository,
  AggregateRoot,
  CommandProcessingAggregate,
} from '@nest-convoy/events/aggregate';

import { DispatchedEvent } from './dispatched-event';
import { getAggregateRepositoryToken } from '@nest-convoy/events/aggregate/aggregate-repository';
import { EntityIdAndVersion } from '@nest-convoy/events/aggregate/interfaces';
import { Command } from '@nest-convoy/commands';

export class EventHandlerContext<E> {
  constructor(
    // private readonly aggregateStore: AggregateStoreCrud,
    private readonly de: DispatchedEvent<E>,
    private readonly moduleRef: ModuleRef,
  ) {}

  private getAggregateRepository<
    A extends CommandProcessingAggregate<any, any>,
    CT extends Command
  >(aggregate: Type<A>): AggregateRepository<A, CT> {
    return this.moduleRef.get(getAggregateRepositoryToken(aggregate), {
      strict: false,
    });
  }

  async save<
    A extends CommandProcessingAggregate<any, any>,
    CT extends Command
  >(
    aggregate: Type<A>,
    command: CT,
    entityId?: string,
  ): Promise<EntityIdAndVersion> {
    const ar = this.getAggregateRepository(aggregate);
    return ar.save(command, {
      triggeringEvent: this.de.eventContext,
      entityId,
    });
  }

  async update<
    A extends CommandProcessingAggregate<any, any>,
    CT extends Command
  >(
    aggregate: Type<A>,
    entityId: string,
    command: CT,
  ): Promise<EntityIdAndVersion> {
    const ar = this.getAggregateRepository(aggregate);
    return ar.update(entityId, command, {
      triggeringEvent: this.de.eventContext,
    });
  }
}
