import { Injectable } from '@nestjs/common';
import type { EachMessagePayload, Message as ProducerMessage } from 'kafkajs';

import {
  Message,
  MessageBuilder,
  MessageHeaders,
} from '@nest-convoy/messaging';

// TODO: Kafka Schema Registry
@Injectable()
export class KafkaMessageBuilder {
  to(message: Message): ProducerMessage {
    return {
      key: message.id,
      value: message.getPayload(),
      // partition: parseFloat(message.getHeader(Message.PARTITION_ID)),
      headers: message.getHeaders().asRecord(),
    };
  }

  from({ message, partition }: EachMessagePayload): Message {
    return (
      MessageBuilder.withPayload(message.value!.toString())
        .withHeader(Message.ID, message.key.toString())
        // .withHeader(Message.PARTITION_ID, partition)
        .withExtraHeaders(
          new MessageHeaders(
            message.headers
              ? Object.entries(message.headers).map(([key, value]) => [
                  key,
                  value!.toString(),
                ])
              : null,
          ),
        )
        .build()
    );
  }
}
