import { Message } from '@nest-convoy/messaging/common';
import { DomainEventHandler } from './domain-event-handler';

export class DomainEventHandlers {
  constructor(private readonly handlers: DomainEventHandler[]) {}

  getHandlers(): DomainEventHandler[] {
    return this.handlers;
  }

  getAggregateTypesAndEvents(): Set<string> {
    return new Set(this.handlers.map(handler => handler.aggregateType));
  }

  findTargetMethod(message: Message): DomainEventHandler | undefined {
    return this.handlers.find(handler => handler.handles(message));
  }
}
