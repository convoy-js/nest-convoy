import { Injectable } from '@nestjs/common';
import { Message } from '@nest-convoy/messaging/common';
import {
  MessageBuilder,
  NestConvoyMessageProducer,
} from '@nest-convoy/messaging/producer';
import {
  DomainEvent,
  DomainEventNameMapping,
  EventMessageHeaders,
} from '@nest-convoy/events/common';

@Injectable()
export class DomainEventPublisher {
  constructor(
    private readonly messageProducer: NestConvoyMessageProducer,
    private readonly domainEventNameMapping: DomainEventNameMapping,
  ) {}

  private makeMessageForDomainEvent(
    aggregateType: string,
    aggregateId: string,
    headers: Map<string, string>,
    event: DomainEvent,
    eventType: string,
  ): Message {
    return MessageBuilder.withPayload(JSON.stringify(event))
      .withExtraHeaders('', headers)
      .withHeader(Message.PARTITION_ID, aggregateId)
      .withHeader(EventMessageHeaders.AGGREGATE_ID, aggregateId)
      .withHeader(EventMessageHeaders.AGGREGATE_TYPE, aggregateType)
      .withHeader(EventMessageHeaders.EVENT_TYPE, eventType)
      .build();
  }

  async publish(
    aggregateType: string,
    aggregateId: string,
    domainEvents: DomainEvent[],
    headers: Map<string, string> = new Map(),
  ): Promise<void> {
    for (const event of domainEvents) {
      const eventType = this.domainEventNameMapping.eventToExternalEventType(
        aggregateType,
        event,
      );
      const domainEventMessage = this.makeMessageForDomainEvent(
        aggregateType,
        aggregateId,
        headers,
        event,
        eventType,
      );
      await this.messageProducer.send(aggregateType, domainEventMessage);
    }
  }
}
