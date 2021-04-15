/**
 * An event that is published to Kafka
 */
export class KafkaPublishedEvent {
  constructor(
    readonly id: string,
    readonly entityId: string,
    readonly entityType: string,
    readonly eventData: string,
    readonly eventType: string,
    readonly metadata?: string,
  ) {}
}
