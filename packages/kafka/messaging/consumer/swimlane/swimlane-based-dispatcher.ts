import { Consumer } from '@nest-convoy/core';

import { SwimlaneDispatcherBacklog } from './swimlane-dispatcher-backlog';
import { SwimlaneDispatcher } from './swimlane-dispatcher';
import { KafkaMessage } from '../kafka-message';

export class SwimlaneBasedDispatcher {
  private readonly dispatchers = new Map<number, SwimlaneDispatcher>();

  // constructor(
  //   private readonly subscriberId: string, // private readonly execute: (cb: () => Promise<void>) => Promise<void>,
  // ) {}

  private getOrCreate(swimlane: number): SwimlaneDispatcher {
    if (!this.dispatchers.has(swimlane)) {
      const swimlaneDispatcher = new SwimlaneDispatcher();
      // this.subscriberId,
      // swimlane,
      // this.execute,
      this.dispatchers.set(swimlane, swimlaneDispatcher);
    }

    return this.dispatchers.get(swimlane);
  }

  dispatch(
    message: KafkaMessage,
    swimlane: number,
    target: Consumer<KafkaMessage>,
  ): Promise<SwimlaneDispatcherBacklog> {
    const swimlaneDispatcher = this.getOrCreate(swimlane);
    return swimlaneDispatcher.dispatch(message, target);
  }
}
