import { Injectable } from '@nestjs/common';
import { EtpoEventContext } from '@nest-convoy/events/aggregate/snapshot';
import {
  SerializedEvent,
  AggregateEvents,
  AggregatesAndEvents,
  SubscriberOptions,
  SubscriptionHandler,
} from '@nest-convoy/events/aggregate';
import {
  KafkaMessageConsumer,
  KafkaMessage,
} from '@nest-convoy/messaging/broker/kafka';

import { KafkaPublishedEvent } from './kafka-published-event';

/**
 * Subscribe to aggregate domain events published to Kafka by CDC
 */
@Injectable()
export class KafkaAggregateSubscriptions implements AggregateEvents {
  constructor(private readonly kafkaMessageConsumer: KafkaMessageConsumer) {}

  private async toSerializedEvent(
    message: KafkaMessage,
    aggregatesAndEvents: AggregatesAndEvents,
  ): Promise<SerializedEvent<any>> {
    const {
      id,
      entityId,
      metadata,
      ...pe
    } = await message.parsePayload<KafkaPublishedEvent>();
    const { partition, offset, topic } = message;

    const etpo = new EtpoEventContext({ id, topic, partition, offset });

    const [aggregate, events] = aggregatesAndEvents.get(pe.entityType)!;
    const eventType = [...events.values()].find(e => e.name === pe.eventType);
    if (!eventType) {
      throw new Error('Missing event type');
    }

    return new SerializedEvent(
      id,
      entityId,
      aggregate,
      JSON.parse(pe.eventData),
      eventType,
      partition,
      offset,
      etpo,
      metadata ? JSON.parse(metadata) : undefined,
    );
  }

  async subscribe(
    subscriberId: string,
    aggregatesAndEvents: AggregatesAndEvents,
    options: SubscriberOptions,
    handler: SubscriptionHandler,
  ): Promise<void> {
    const topics = [...aggregatesAndEvents.keys()];
    const subscription = await this.kafkaMessageConsumer.subscribe(
      subscriberId,
      topics,
      async message => {
        const se = await this.toSerializedEvent(message, aggregatesAndEvents);

        if (aggregatesAndEvents.has(se.entityType.name)) {
          await handler(se);
        }
      },
    );
  }
}
