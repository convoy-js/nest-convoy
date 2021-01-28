import { EventHandler } from './event-handler';

export interface EventHandlerProcessor {
  supports(fieldOrMethod: any): boolean;
  process(eventHandler: any, fieldOrMethod: any): any;
}

// export class EventHandlerMethodProcessor implements EventHandlerProcessor {
//
// }
