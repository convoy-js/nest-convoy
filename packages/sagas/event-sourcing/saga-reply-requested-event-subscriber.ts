export class SagaReplyRequestedEventSubscriber {
  constructor(
    readonly subscriberId: string,
    readonly aggregateTypes: string[],
  ) {}

  subscribe() {}
}
