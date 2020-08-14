import { Message } from '@nest-convoy/messaging/common';

export class StashedMessage {
  constructor(
    readonly sagaType: string,
    readonly sagaId: string,
    readonly message: Message,
  ) {}
}
