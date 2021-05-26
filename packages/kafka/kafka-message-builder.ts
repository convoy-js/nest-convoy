import type { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Inject, Injectable, Optional } from '@nestjs/common';
import type {
  EachMessagePayload,
  IHeaders,
  Message as ProducerMessage,
} from 'kafkajs';

import {
  Message,
  MessageBuilder,
  MessageHeaders,
} from '@nest-convoy/messaging';

import { KafkaMessage } from './kafka-message';
// import { avroSchemaRegistry } from './avro-schema';
import { AvroSchemaRegistry } from './schema';
import { KAFKA_SCHEMA_REGISTRY } from './tokens';

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

    const headers = message.getHeaders().asRecord();

    return {
      key: message.id,
      // Need to do this for compatibility with eventuate cdc
      value: JSON.stringify({
        payload: message.getPayload(),
        headers,
      }),
      // partition: parseFloat(message.getHeader(Message.PARTITION_ID)),
      headers,
    };
  }

  async from({
    message,
    partition,
  }: EachMessagePayload): Promise<KafkaMessage> {
    const payload =
      (await this.registry?.decode(message.value!)) || message.value!;

    const data = JSON.parse(payload.toString()) as {
      headers: IHeaders;
      payload: Record<string, unknown>;
    };

    const headers = new MessageHeaders(
      message.headers
        ? Object.entries({
            ...message.headers,
            ...data.headers,
          }).map(([key, value]) => [key, value!.toString()])
        : null,
    );

    return KafkaMessage.from(
      MessageBuilder.withPayload(data.payload)
        .withHeader(Message.ID, message.key!.toString())
        // .withHeader(Message.PARTITION_ID, partition)
        .withExtraHeaders(headers)
        .build(),
      // eslint-disable-next-line prefer-rest-params
      arguments[0] as EachMessagePayload,
    );
  }
}
