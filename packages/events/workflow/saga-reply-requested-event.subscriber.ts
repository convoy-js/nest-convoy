import { Injectable } from '@nestjs/common';

export class SagaReplyRequestedEventSubscriber {
  constructor(
    private readonly subscriberId: string,
    private readonly aggregateTypes: string[],
  ) {}

  async subscribe(): Promise<void> {}
}
