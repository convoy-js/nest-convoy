import { MessageHeaders } from '@nest-convoy/messaging';

export class SagaReplyRequestedEvent {
  constructor(readonly correlationHeaders: MessageHeaders) {}
}
