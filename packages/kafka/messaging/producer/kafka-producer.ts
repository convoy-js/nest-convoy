import { Injectable } from '@nestjs/common';
import { KafkaClient } from '@nest-convoy/kafka/common';
import { RecordMetadata } from 'kafkajs';

@Injectable()
export class KafkaProducer {
  private readonly producer = this.kafka.producer({
    idempotent: true,
    maxInFlightRequests: 1,
  });

  constructor(private readonly kafka: KafkaClient) {}

  send(
    topic: string,
    key: string,
    body: string,
    partition?: number,
  ): Promise<RecordMetadata[]> {
    return this.producer.send({
      topic,
      messages: [
        {
          value: body,
          key,
          partition,
        },
      ],
    });
  }
}
