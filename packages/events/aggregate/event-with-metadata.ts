import { Type } from '@nestjs/common';

export class EventWithMetadata<E> {
  constructor(
    readonly event: E,
    readonly id: number,
    readonly metadata?: Record<string, unknown>,
  ) {}
}

export class EventTypeAndData<E> {
  constructor(
    readonly eventType: Type<E>,
    readonly eventData: string,
    readonly metadata?: string,
  ) {}
}

export class EventIdTypeAndData<E> extends EventTypeAndData<E> {
  constructor(
    readonly id: number,
    { eventType, eventData, metadata }: EventTypeAndData<E>,
  ) {
    super(eventType, eventData, metadata);
  }
}
