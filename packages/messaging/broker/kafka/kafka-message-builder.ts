import type { EachMessagePayload, Message as ProducerMessage } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Inject, Injectable, Optional } from '@nestjs/common';

import {
  Message,
  MessageBuilder,
  MessageHeaders,
} from '@nest-convoy/messaging';

import { KafkaMessage } from './kafka-message';
import { KAFKA_SCHEMA_REGISTRY } from './tokens';
// import { avroSchemaRegistry } from './avro-schema';
import { AvroSchemaRegistry } from './avro-schema-registry';

@Injectable()
export class KafkaMessageBuilder {
  constructor(
    private readonly avroSchemaRegistry: AvroSchemaRegistry,
    @Optional()
    @Inject(KAFKA_SCHEMA_REGISTRY)
    private readonly registry: SchemaRegistry | undefined,
  ) {}

  async to(message: Message): Promise<ProducerMessage> {
    let value: string | Buffer;
    if (this.registry) {
      // message = KafkaMessage.from(message);
      value = await this.avroSchemaRegistry.encode(message);
      // if (message instanceof KafkaMessage) {
      //   // console.log('payload', JSON.stringify(message.getPayload(), null, 2));
      //   // console.log('schema', JSON.stringify(message.schema, null, 2));
      //   let registryId: number;
      //   const {
      //     schema,
      //     namespace,
      //     subject,
      //     version,
      //     id: schemaId,
      //   } = message.schema;
      //   if (schema) {
      //     const { id } = await this.registry.register(schema as any, {
      //       subject,
      //     });
      //     registryId = id;
      //   } else if (!schemaId) {
      //     registryId = version
      //       ? await this.registry.getRegistryId(subject, version)
      //       : await this.registry.getLatestSchemaId(subject);
      //   } else {
      //     registryId = schemaId;
      //   }
      //
      //   message.setHeader(KafkaMessage.SCHEMA_ID, registryId!);
      //   value = await this.registry.encode(registryId!, message.getPayload());
      // }
    } else {
      value = JSON.stringify(message.getPayload());
    }

    return {
      key: message.id,
      value: value!,
      // partition: parseFloat(message.getHeader(Message.PARTITION_ID)),
      headers: message.getHeaders().asRecord(),
    };
  }

  async from({
    message,
    partition,
  }: EachMessagePayload): Promise<KafkaMessage> {
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

    return KafkaMessage.from(
      MessageBuilder.withPayload(payload.toString())
        .withHeader(Message.ID, message.key!.toString())
        // .withHeader(Message.PARTITION_ID, partition)
        .withExtraHeaders(headers)
        .build(),
      arguments[0] as EachMessagePayload,
    );
  }
}
