import { Type } from '@nestjs/common';

import { EventContext } from './event-context';

export class SerializedEvent<E> {
  constructor(
    readonly id: number,
    readonly entityId: string,
    readonly entityType: Type<any>,
    readonly eventData: string,
    readonly eventType: Type<E>,
    readonly swimLane: number,
    readonly offset: number,
    readonly eventContext: EventContext,
    readonly metadata?: string,
  ) {}
}
