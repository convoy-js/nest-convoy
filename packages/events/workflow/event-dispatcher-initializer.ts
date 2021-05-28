import { validatedPlainToClass } from '@deepkit/type';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import type { OnModuleInit, Type } from '@nestjs/common';
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { DOMAIN_EVENT_HANDLER } from '@nest-convoy/core/tokens';
import type {
  SerializedEvent,
  SubscriberOptions,
} from '@nest-convoy/events/aggregate';
import {
  AGGREGATE_EVENTS,
  AggregateEvents,
  AggregatesAndEvents,
} from '@nest-convoy/events/aggregate';
import {
  EVENT_SCHEMA_MANAGER,
  EventSchemaManager,
} from '@nest-convoy/events/aggregate/schema';

import { EVENT_AGGREGATE_META } from '../aggregate/event-aggregate';
import { DispatchedEvent } from './dispatched-event';
import type { EventSubscriberHandler } from './event-handler';
import { EventHandlerContext } from './event-handler-context';
import { EVENT_SUBSCRIBER_META } from './event-subscriber';

@Injectable()
export class EventDispatcherInitializer implements OnModuleInit {
  constructor(
    private readonly discovery: DiscoveryService,
    private readonly moduleRef: ModuleRef,
    @Inject(EVENT_SCHEMA_MANAGER)
    private readonly eventSchemaManager: EventSchemaManager,
    @Inject(AGGREGATE_EVENTS)
    private readonly aggregateEvents: AggregateEvents,
  ) {}

  private async toDispatchedEvent<E>(
    se: SerializedEvent<E>,
  ): Promise<DispatchedEvent<E>> {
    const event = await validatedPlainToClass<Type<E>>(
      se.eventType,
      se.eventData,
    );

    return new DispatchedEvent<E>(
      se.id,
      se.entityId,
      event,
      se.offset,
      se.eventContext,
      se.metadata,
    );
  }

  async onModuleInit(): Promise<void> {
    const eventSubscribers = await this.discovery.providersWithMetaAtKey(
      EVENT_SUBSCRIBER_META,
    );
    const eventSubscriberNames = eventSubscribers.map(
      p => p.discoveredClass.name,
    );

    const eventHandlerMethods =
      await this.discovery.providerMethodsWithMetaAtKey(
        DOMAIN_EVENT_HANDLER,
        item => eventSubscriberNames.includes(item.name),
      );

    await Promise.all(
      eventSubscribers.map(async es => {
        const metaHandlers = eventHandlerMethods
          .map(({ meta, discoveredMethod: { handler } }): {
            event: Type;
            handler: EventSubscriberHandler;
          } => ({
            event: meta as Type,
            handler,
          }))
          .map(({ event, handler }): {
            event: Type;
            aggregate: Type;
            handler: EventSubscriberHandler;
          } => ({
            aggregate: Reflect.getMetadata(EVENT_AGGREGATE_META, event as Type),
            event,
            handler,
          }));

        metaHandlers.forEach(({ event, handler: handle, aggregate }) => {
          // TODO: Refactor this & create a KafkaMultiMessageConverter
          const aggregatesAndEvents = new AggregatesAndEvents([
            [aggregate.name, [aggregate, new Set([event])]],
          ]);

          return this.aggregateEvents.subscribe(
            es.discoveredClass.name,
            aggregatesAndEvents,
            es.meta as SubscriberOptions,
            async se => {
              const de = await this.toDispatchedEvent<any>(
                this.eventSchemaManager.upcastEvent(se),
              );
              const ctx = new EventHandlerContext<any>(de, this.moduleRef);

              // TODO: Retry options etc
              await handle(ctx);
            },
          );
        });
      }),
    );
  }
}
