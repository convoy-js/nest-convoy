import { EventContext } from '../event-context';

export class AggregateCrudFindOptions {
  constructor(readonly triggeringEvent?: EventContext) {}

  withTriggeringEvent(triggeringEvent: EventContext): AggregateCrudFindOptions {
    return new AggregateCrudFindOptions(triggeringEvent);
  }
}
