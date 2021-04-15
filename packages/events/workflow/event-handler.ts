import { AsyncLikeFn } from '@nest-convoy/common';

import { EventHandlerContext } from './event-handler-context';

export function EventHandler() {}

export type EventSubscriberHandler<E = any> = AsyncLikeFn<
  [ctx: EventHandlerContext<E>],
  any
>;
