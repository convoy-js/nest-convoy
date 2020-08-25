import { Logger } from '@nestjs/common';

import { ConvoyMessageConsumer } from '@nest-convoy/messaging/consumer';
import { Message } from '@nest-convoy/messaging/common';
import { Dispatcher } from '@nest-convoy/common';
import { DomainEvent, EventMessageHeaders } from '@nest-convoy/events/common';

import { DomainEventHandlers } from './domain-event-handlers';
import { DomainEventEnvelope } from './domain-event-envelope';

export class DomainEventDispatcher implements Dispatcher {
  private readonly logger = new Logger(this.constructor.name, true);

  constructor(
    private readonly eventDispatcherId: string,
    private readonly domainEventHandlers: DomainEventHandlers,
    private readonly messageConsumer: ConvoyMessageConsumer,
  ) {}

  async subscribe(): Promise<void> {
    await this.messageConsumer.subscribe(
      this.eventDispatcherId,
      this.domainEventHandlers.getAggregateTypesAndEvents(),
      this.handleMessage.bind(this),
      true,
    );
  }

  async handleMessage(message: Message): Promise<void> {
    const aggregateType = message.getRequiredHeader(
      EventMessageHeaders.AGGREGATE_TYPE,
    );

    const handler = this.domainEventHandlers.findTargetMethod(message);
    if (!handler) return;

    const event = Object.assign(
      new handler.event(),
      message.parsePayload<DomainEvent>(),
    );
    const aggregateId = message.getRequiredHeader(
      EventMessageHeaders.AGGREGATE_ID,
    );
    const messageId = message.getRequiredHeader(Message.ID);
    const dee = new DomainEventEnvelope(
      message,
      aggregateType,
      aggregateId,
      messageId,
      event,
    );

    await handler.invoke(dee);
  }
}
