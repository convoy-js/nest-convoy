import type { Type, ObjectLiteral } from '@nest-convoy/common';

export interface EventUpcaster {
  upcast(json: ObjectLiteral): ObjectLiteral;
}

export class EventRename<A, B> {
  constructor(readonly oldEventType: Type<A>, readonly newEventType: Type<B>) {}

  isFor<E>(eventType: Type<E>): boolean {
    return eventType.name === this.oldEventType.name;
  }
}

export class EventTransform<E> {
  constructor(readonly eventType: Type<E>, readonly upcaster: EventUpcaster) {}

  isFor<E>(eventType: Type<E>): boolean {
    return eventType.name === this.eventType.name;
  }
}

export class AggregateSchemaVersion {
  constructor(
    readonly version: string,
    private readonly renames: EventRename<any, any>[],
    private readonly transforms: EventTransform<any>[],
  ) {}

  findUpcaster<E>(eventType: Type<E>): EventUpcaster | undefined {
    return this.transforms.find(t => t.isFor(eventType))?.upcaster;
  }

  maybeRename<E>(eventType: Type<E>): Type<any> {
    return (
      this.renames.find(r => r.isFor(eventType))?.newEventType || eventType
    );
  }
}
