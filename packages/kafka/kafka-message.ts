import type { Type } from '@nestjs/common';
import type { schema } from 'avsc';
import type { EachMessagePayload } from 'kafkajs';

import type { Consumer } from '@nest-convoy/common';
import { Message, MessageHeaders } from '@nest-convoy/messaging';

import {
  AvroSchemaMetadata,
  lazyLoadAvroSchema,
  getAvroSchemaMetadata,
  // avroSchemaRegistry,
} from './schema';

export interface KafkaMessageSchema extends Partial<AvroSchemaMetadata> {
  readonly id?: number;
  readonly schema: schema.RecordType;
  readonly subject: string;
}

export type KafkaMessageHandler = Consumer<KafkaMessage, void>;

export class KafkaMessage extends Message {
  static PARTITION = 'kafka_partition';
  static OFFSET = 'kafka_offset';
  static TOPIC = 'kafka_topic';
  static SCHEMA_NAMESPACE = 'schema_namespace';
  static SCHEMA_VERSION = 'schema_version';
  static SCHEMA_ID = 'schema_id';
  static SCHEMA_SUBJECT = 'schema_subject';

  static from(
    message: Message,
    kafkaPayload: EachMessagePayload,
  ): KafkaMessage {
    return new KafkaMessage(
      message.getPayload(),
      message.getHeaders(),
      kafkaPayload,
    );
  }

  get topic(): string {
    return this.getRequiredHeader(KafkaMessage.TOPIC);
  }

  get partition(): number {
    return +this.getRequiredHeader(KafkaMessage.PARTITION);
  }

  get offset(): bigint {
    return BigInt(this.getRequiredHeader(KafkaMessage.OFFSET));
  }

  get schemaType(): Type | undefined {
    return undefined;
    // return avroSchemaRegistry.find(({ target }) => target.name === this.type)
    //   ?.target;
  }

  get schemaId(): number | undefined {
    return this.hasHeader(KafkaMessage.SCHEMA_ID)
      ? +this.getRequiredHeader(KafkaMessage.SCHEMA_ID)
      : undefined;
  }

  constructor(
    payload: any,
    headers: MessageHeaders,
    { topic, partition, message: { offset } }: EachMessagePayload,
  ) {
    super(payload, headers);

    this.setHeader(KafkaMessage.TOPIC, topic);
    this.setHeader(KafkaMessage.PARTITION, partition);
    this.setHeader(KafkaMessage.OFFSET, offset);
  }

  get schema(): KafkaMessageSchema {
    const namespace = this.getRequiredHeader(KafkaMessage.SCHEMA_NAMESPACE);
    const id = this.hasHeader(KafkaMessage.SCHEMA_ID)
      ? +this.getRequiredHeader(KafkaMessage.SCHEMA_ID)
      : undefined;
    const version = +this.getRequiredHeader(KafkaMessage.SCHEMA_VERSION);
    // const version = this.hasHeader(KafkaMessage.SCHEMA_VERSION)
    //   ? +this.getRequiredHeader(KafkaMessage.SCHEMA_VERSION)
    //   : undefined;
    const subject = this.getHeader(KafkaMessage.SCHEMA_SUBJECT);

    return {
      schema: lazyLoadAvroSchema(this.type, { namespace, version }),
      subject,
      namespace,
      version,
      id,
    };
  }
}
