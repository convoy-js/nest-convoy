import type { EachMessagePayload, Message as ProducerMessage } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Inject, Injectable } from '@nestjs/common';

import {
  Message,
  MessageBuilder,
  MessageHeaders,
} from '@nest-convoy/messaging';

import { KafkaMessage } from './kafka-message';
import { KAFKA_SCHEMA_REGISTRY } from './tokens';

@Injectable()
export class KafkaMessageBuilder {
  constructor(
    @Inject(KAFKA_SCHEMA_REGISTRY)
    private readonly registry: SchemaRegistry | undefined,
  ) {}

  async to(message: Message): Promise<ProducerMessage> {
    let value: string | Buffer;
    if (this.registry) {
      message = KafkaMessage.from(message);

      if (message instanceof KafkaMessage) {
        let registryId: number;
        const {
          schema,
          namespace,
          subject,
          version,
          id: schemaId,
        } = message.schema;
        if (schema) {
          const { id } = await this.registry.register(schema as any, {
            subject,
          });
          registryId = id;
        } else if (!schemaId) {
          registryId = version
            ? await this.registry.getRegistryId(subject, version)
            : await this.registry.getLatestSchemaId(subject);
        } else {
          registryId = schemaId;
        }

        message.setHeader(KafkaMessage.SCHEMA_ID, registryId!);
        value = await this.registry.encode(registryId!, message.getPayload());
      }
    }

    return {
      key: message.id,
      value: value!,
      // partition: parseFloat(message.getHeader(Message.PARTITION_ID)),
      headers: message.getHeaders().asRecord(),
    };
  }

  async from({ message, partition }: EachMessagePayload): Promise<Message> {
    const headers = new MessageHeaders(
      message.headers
        ? Object.entries(message.headers).map(([key, value]) => [
            key,
            value!.toString(),
          ])
        : null,
    );

    const payload =
      (await this.registry?.decode(message.value!)) || message.value!;

    return (
      MessageBuilder.withPayload(payload.toString())
        .withHeader(Message.ID, message.key!.toString())
        // .withHeader(Message.PARTITION_ID, partition)
        .withExtraHeaders(headers)
        .build()
    );
  }
}
