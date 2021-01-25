import { Type } from '@nestjs/common';
import type { schema } from 'avsc';

import { Message, MessageHeaders } from '@nest-convoy/messaging';

import {
  AvroSchemaMetadata,
  getAvroSchemaMetadata,
  internalSchemaRegistry,
} from './avro-schema';

export interface KafkaMessageSchema extends Partial<AvroSchemaMetadata> {
  readonly subject: string;
  readonly id?: number;
}

export class KafkaMessage extends Message {
  static SCHEMA_NAMESPACE = 'schema_namespace';
  static SCHEMA_VERSION = 'schema_version';
  static SCHEMA_ID = 'schema_id';
  static SCHEMA_SUBJECT = 'schema_subject';

  static from(message: Message): KafkaMessage {
    return new KafkaMessage(message.getPayload(), message.getHeaders());
  }

  private readonly avroSchema: schema.RecordType;

  get schemaType(): Type | undefined {
    return internalSchemaRegistry.get(this.type);
  }

  get schemaId(): number | undefined {
    return this.hasHeader(KafkaMessage.SCHEMA_ID)
      ? +this.getRequiredHeader(KafkaMessage.SCHEMA_ID)
      : undefined;
  }

  constructor(payload: string, headers: MessageHeaders) {
    super(payload, headers);

    const { namespace, version, schema } = getAvroSchemaMetadata(
      this.schemaType!,
    );
    const subject = `${namespace}.${this.type}`;

    this.setHeaders(
      new MessageHeaders([
        [KafkaMessage.SCHEMA_NAMESPACE, namespace],
        [KafkaMessage.SCHEMA_VERSION, `${version}`],
        [KafkaMessage.SCHEMA_SUBJECT, subject],
        ...this.getHeaders(),
      ]),
    );

    this.avroSchema = schema;
  }

  get schema(): KafkaMessageSchema {
    const namespace = this.getRequiredHeader(KafkaMessage.SCHEMA_NAMESPACE);
    const id = this.hasHeader(KafkaMessage.SCHEMA_ID)
      ? +this.getRequiredHeader(KafkaMessage.SCHEMA_ID)
      : undefined;
    const version = this.hasHeader(KafkaMessage.SCHEMA_VERSION)
      ? +this.getRequiredHeader(KafkaMessage.SCHEMA_VERSION)
      : undefined;
    const subject = this.getHeader(KafkaMessage.SCHEMA_SUBJECT);

    return {
      subject,
      schema: this.avroSchema,
      namespace,
      version,
      id,
    };
  }
}
