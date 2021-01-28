import { Type } from '@nestjs/common';

import { EventContext } from './event-context';
import { EventMetadata } from './interfaces';

export class SerializedEvent<E> {
  constructor(
    readonly id: string,
    readonly entityId: string,
    readonly entityType: Type<unknown>,
    readonly eventData: Record<string, unknown>,
    readonly eventType: Type<E>,
    readonly partition: number,
    readonly offset: bigint,
    readonly eventContext: EventContext,
    readonly metadata?: EventMetadata,
  ) {}
}
