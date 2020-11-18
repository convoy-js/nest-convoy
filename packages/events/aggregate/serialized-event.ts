import { Type } from '@nestjs/common';

import { EventContext } from './event-context';

export class SerializedEvent<E> {
  constructor(
    readonly id: string,
    readonly entityId: string,
    readonly entityType: Type<unknown>,
    readonly eventData: Record<string, unknown>,
    readonly eventType: Type<E>,
    readonly swimLane: number,
    readonly offset: number,
    readonly eventContext: EventContext,
    readonly metadata: Record<string, string>,
  ) {}
}
