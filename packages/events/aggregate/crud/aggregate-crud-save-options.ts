import { EventContext } from '../event-context';

export class AggregateCrudSaveOptions {
  constructor(
    readonly triggeringEvent?: EventContext,
    readonly entityId?: string,
  ) {}

  withEntityId(entityId: string): AggregateCrudSaveOptions {
    return new AggregateCrudSaveOptions(this.triggeringEvent, entityId);
  }

  withTriggeringEvent(triggeringEvent: EventContext): AggregateCrudSaveOptions {
    return new AggregateCrudSaveOptions(triggeringEvent, this.entityId);
  }
}
