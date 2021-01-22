import { Type } from '@nestjs/common';
import type { schema } from 'avsc';

import { Message, MessageHeaders } from '@nest-convoy/messaging';

import {
  AVRO_SCHEMA_METADATA,
  AvroSchemaMetadata,
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

  private readonly _schema: schema.RecordType;

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

    const { namespace, version, schema } = Reflect.getMetadata(
      AVRO_SCHEMA_METADATA,
      this.schemaType!,
    ) as AvroSchemaMetadata;

    const subject = `${namespace}.${this.type}`;

    this.setHeaders(
      new MessageHeaders([
        [KafkaMessage.SCHEMA_NAMESPACE, namespace],
        [KafkaMessage.SCHEMA_VERSION, `${version}`],
        [KafkaMessage.SCHEMA_SUBJECT, subject],
        ...this.getHeaders(),
      ]),
    );

    this._schema = schema;
  }

  get schema(): KafkaMessageSchema {
    const namespace = this.getRequiredHeader(KafkaMessage.SCHEMA_NAMESPACE);
    const id = this.hasHeader(KafkaMessage.SCHEMA_ID)
      ? +this.getRequiredHeader(KafkaMessage.SCHEMA_ID)
      : undefined;
    const version = this.hasHeader(KafkaMessage.SCHEMA_VERSION)
      ? +this.getRequiredHeader(KafkaMessage.SCHEMA_VERSION)
      : undefined;
    // TODO
    const subject = this.getHeader(KafkaMessage.SCHEMA_SUBJECT);
    const type = internalSchemaRegistry.get(this.type);

    return {
      subject,
      schema: this._schema,
      namespace,
      version,
      id,
    };
  }
}
