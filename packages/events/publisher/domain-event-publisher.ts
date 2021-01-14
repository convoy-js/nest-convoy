import { Injectable } from '@nestjs/common';

import { Message, MessageHeaders } from '@nest-convoy/messaging/common';
import { DomainEvent, EventMessageHeaders } from '@nest-convoy/events/common';
import {
  MessageBuilder,
  ConvoyMessageProducer,
} from '@nest-convoy/messaging/producer';

@Injectable()
export class DomainEventPublisher {
  constructor(private readonly messageProducer: ConvoyMessageProducer) {}

  private createMessageForDomainEvent(
    aggregateType: string,
    aggregateId: string | number,
    headers: MessageHeaders,
    event: DomainEvent,
  ): Message {
    return (
      MessageBuilder.withPayload(event)
        .withExtraHeaders(headers)
        // .withHeader(Message.PARTITION_ID, aggregateId)
        .withHeader(EventMessageHeaders.AGGREGATE_ID, aggregateId)
        .withHeader(EventMessageHeaders.AGGREGATE_TYPE, aggregateType)
        .withHeader(EventMessageHeaders.EVENT_TYPE, event.constructor.name)
        .build()
    );
  }

  async publish(
    aggregateType: string,
    aggregateId: string | number,
    domainEvents: readonly DomainEvent[],
    headers = new MessageHeaders(),
  ): Promise<void> {
    const messages = domainEvents.map(de =>
      this.createMessageForDomainEvent(aggregateType, aggregateId, headers, de),
    );

    await this.messageProducer.sendBatch(aggregateType, messages, true);

    //   for (const event of domainEvents) {
    //     // const eventType = this.domainEventNameMapping.eventToExternalEventType(
    //     //   aggregateType?.name,
    //     //   event,
    //     // );
    //     const domainEventMessage = this.createMessageForDomainEvent(
    //       aggregateType,
    //       String(aggregateId),
    //       headers,
    //       event,
    //     );
    //
    //     await this.messageProducer.send(
    //       aggregateType.name,
    //       domainEventMessage,
    //       true,
    //     );
    //   }
  }
}
