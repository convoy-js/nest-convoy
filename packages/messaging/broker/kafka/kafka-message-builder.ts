import { Injectable } from '@nestjs/common';
import type {
  KafkaMessage as ConsumerMessage,
  Message as ProducerMessage,
} from 'kafkajs';

import { Message, MessageBuilder } from '@nest-convoy/messaging';

@Injectable()
export class KafkaMessageBuilder {
  to(message: Message): ProducerMessage {
    return {
      key: message.id,
      value: message.getPayload(),
      headers: message.getHeadersAsRecord(),
    };
  }

  from(message: ConsumerMessage): Message {
    return MessageBuilder.withPayload(message.value!.toString())
      .withHeader(Message.ID, message.key.toString())
      .withExtraHeaders(
        new Map(
          message.headers
            ? Object.entries(message.headers).map(([k, v]) => [k, v.toString()])
            : null,
        ),
      )
      .build();
  }
}
