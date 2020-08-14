import { Injectable, Type } from '@nestjs/common';
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
    return (
      MessageBuilder.withPayload(event)
        .withExtraHeaders('', headers)
        // .withHeader(Message.ID, aggregateId)
        .withHeader(Message.PARTITION_ID, aggregateId)
        .withHeader(EventMessageHeaders.AGGREGATE_ID, aggregateId)
        .withHeader(EventMessageHeaders.AGGREGATE_TYPE, aggregateType)
        .withHeader(EventMessageHeaders.EVENT_TYPE, event.constructor.name)
        .build()
    );
  }

  async publish(
    aggregateType: Type<any> | undefined,
    aggregateId: string | undefined,
    domainEvents: DomainEvent[],
    headers: Map<string, string> = new Map(),
  ): Promise<void> {
    for (const event of domainEvents) {
      const eventName = event.constructor.name;
      // const eventType = this.domainEventNameMapping.eventToExternalEventType(
      //   aggregateType?.name,
      //   event,
      // );
      const domainEventMessage = this.createMessageForDomainEvent(
        aggregateType?.name || eventName,
        aggregateId || eventName,
        headers,
        event,
      );

      await this.messageProducer.send(
        aggregateId || eventName,
        domainEventMessage,
      );
    }
  }
}
