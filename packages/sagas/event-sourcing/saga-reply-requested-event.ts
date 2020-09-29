import { MessageHeaders } from '@nest-convoy/messaging/common';

export class SagaReplyRequestedEvent {
  constructor(readonly correlationHeaders: MessageHeaders) {}
}
