import { Injectable } from '@nestjs/common';
import type {
  KafkaMessage as ConsumerMessage,
  Message as ProducerMessage,
} from 'kafkajs';

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
      headers: message.getHeaders().asRecord(),
    };
  }

  from(message: ConsumerMessage): Message {
    return MessageBuilder.withPayload(message.value!.toString())
      .withHeader(Message.ID, message.key.toString())
      .withExtraHeaders(
        new MessageHeaders(
          message.headers
            ? Object.entries(message.headers).map(([k, v]) => [k, v.toString()])
            : null,
        ),
      )
      .build();
  }
}
