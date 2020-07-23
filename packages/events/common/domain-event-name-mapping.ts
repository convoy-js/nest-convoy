import { Injectable } from '@nestjs/common';

import { DomainEvent } from './domain-event';

@Injectable()
export class DomainEventNameMapping {
  eventToExternalEventType(aggregateType: string, event: DomainEvent): string {
    return event.constructor.name;
  }

  externalEventTypeToEventClassName(
    aggregateType: string,
    eventTypeHeader: string,
  ): string {
    return eventTypeHeader;
  }
}
