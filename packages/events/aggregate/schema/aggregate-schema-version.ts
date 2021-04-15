import type { Type, ObjectLiteral } from '@nest-convoy/common';

export interface EventUpcaster {
  upcast(json: ObjectLiteral): ObjectLiteral;
}

export class EventRename<A = any, B = any> {
  constructor(readonly oldEventName: string, readonly newEventType: Type<B>) {}

  isFor<E>(eventType: Type<E>): boolean {
    return eventType.name === this.oldEventName;
  }
}

export class EventTransform<E = any> {
  constructor(readonly eventName: string, readonly upcaster: EventUpcaster) {}

  isFor<E>(eventType: Type<E>): boolean {
    return eventType.name === this.eventName;
  }
}

export class AggregateSchemaVersion {
  constructor(
    readonly version: number,
    private readonly renames: readonly EventRename[],
    private readonly transforms: readonly EventTransform[],
  ) {}

  findUpcaster<E>(eventType: Type<E>): EventUpcaster | undefined {
    return this.transforms.find(t => t.isFor(eventType))?.upcaster;
  }

  maybeRename<E>(eventType: Type<E>): Type {
    return (
      this.renames.find(r => r.isFor(eventType))?.newEventType || eventType
    );
  }
}
