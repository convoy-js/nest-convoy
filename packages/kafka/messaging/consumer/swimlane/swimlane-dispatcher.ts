import { Consumer } from '@nest-convoy/core';

import { KafkaMessage } from '../kafka-message';
import { SwimlaneDispatcherBacklog } from './swimlane-dispatcher-backlog';

export class QueuedMessage {
  constructor(
    readonly message: KafkaMessage,
    readonly consumeMessage: Consumer<KafkaMessage>,
  ) {}
}

export class SwimlaneDispatcher {
  private queue: QueuedMessage[] = [];
  private readonly consumerStatus = new SwimlaneDispatcherBacklog(this.queue);
  public running = false;

  // constructor(
  //   private readonly subscriberId: string,
  //   private readonly swimlane: number,
  // ) // private readonly execute: (cb: () => Promise<void>) => Promise<void>,
  // {}

  private async processNextQueuedMessage(): Promise<void> {
    await this.processQueuedMessage();
    // await this.execute(() => this.processNextQueuedMessage());
  }

  private async processQueuedMessage(): Promise<void> {
    const queuedMessage = this.getNextMessage();

    while (true) {
      if (!queuedMessage) return;

      try {
        await queuedMessage.consumeMessage(queuedMessage.message);
      } catch {}
    }
  }

  private getNextMessage(): QueuedMessage | undefined {
    const queuedMessage = this.queue.pop();
    if (!queuedMessage) this.running = false;
    return queuedMessage;
  }

  async dispatch(
    message: KafkaMessage,
    messageConsumer: Consumer<KafkaMessage>,
  ): Promise<SwimlaneDispatcherBacklog> {
    const queuedMessage = new QueuedMessage(message, messageConsumer);
    this.queue.push(queuedMessage);

    if (!this.running) {
      this.running = true;
      await this.processNextQueuedMessage();
    }

    return this.consumerStatus;
  }
}
