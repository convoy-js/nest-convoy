export class KafkaSubscription {
  constructor(readonly close: () => Promise<void>) {}
}
