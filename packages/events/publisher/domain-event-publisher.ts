import { Injectable } from '@nestjs/common';

import { Message } from '@nest-convoy/messaging/common';
import {
  MessageBuilder,
  ConvoyMessageProducer,
} from '@nest-convoy/messaging/producer';
import {
  DomainEvent,
  // DomainEventNameMapping,
  EventMessageHeaders,
} from '@nest-convoy/events/common';

@Injectable()
export class DomainEventPublisher {
  constructor(
    private readonly messageProducer: ConvoyMessageProducer, // private readonly domainEventNameMapping: DomainEventNameMapping,
  ) {}

  private createMessageForDomainEvent(
    aggregateType: string,
    aggregateId: string,
    headers: Map<string, string>,
    event: DomainEvent,
  ): Message {
    return MessageBuilder.withPayload(event)
      .withExtraHeaders(headers)
      .withHeader(Message.PARTITION_ID, aggregateId)
      .withHeader(EventMessageHeaders.AGGREGATE_ID, aggregateId)
      .withHeader(EventMessageHeaders.AGGREGATE_TYPE, aggregateType)
      .withHeader(EventMessageHeaders.EVENT_TYPE, event.constructor.name)
      .build();
  }

  async publish(
    aggregateType: string,
    aggregateId: string | number,
    domainEvents: readonly DomainEvent[],
    headers: Map<string, string> = new Map(),
  ): Promise<void> {
    for (const event of domainEvents) {
      // const eventType = this.domainEventNameMapping.eventToExternalEventType(
      //   aggregateType?.name,
      //   event,
      // );
      const domainEventMessage = this.createMessageForDomainEvent(
        aggregateType,
        String(aggregateId),
        headers,
        event,
      );

      await this.messageProducer.send(aggregateType, domainEventMessage, true);
    }
  }
}
