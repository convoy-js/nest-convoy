// import { CommandDispatcherFactory } from '@nest-convoy/commands';
// import { Message, MessageHandler } from '@nest-convoy/messaging';
//
// class Queue {}
//
// export class SwimlaneDispatcher {
//   private readonly queues = new Map<string, Map<number, Queue>>();
//
//   constructor(private readonly handlers: Map<string, readonly MessageHandler[]>) {
//   }
//
//   private getQueue(topic: string, partition: number): Queue | undefined {
//     if (!this.queues.has(topic)) {
//       this.queues.set(topic, new Map());
//     }
//
//     return this.queues.get(topic)!.get(partition);
//   }
//
//   dispatch(message: Message): Promise<void> {
//     let queue = this.getQueue(topic, partitionId);
//     if (!queue) {
//
//     }
//
//   }
// }
