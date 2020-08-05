import { MessageConsumerBacklog } from '../basic/message-consumer-backlog';
import { QueuedMessage } from './swimlane-dispatcher';

export class SwimlaneDispatcherBacklog implements MessageConsumerBacklog {
  constructor(private readonly queue: QueuedMessage[]) {}

  size(): number {
    return this.queue.length;
  }
}
