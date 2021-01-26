import { Type } from '@nestjs/common';
import type { schema } from 'avsc';

import { Message, MessageHeaders } from '@nest-convoy/messaging';

import {
  AvroSchemaMetadata,
  lazyLoadAvroSchema,
  getAvroSchemaMetadata,
  // avroSchemaRegistry,
} from './avro-schema';

export interface KafkaMessageSchema extends Partial<AvroSchemaMetadata> {
  readonly schema: schema.RecordType;
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

  constructor(payload: any, headers: MessageHeaders) {
    super(payload, headers);
    //
    // const { namespace, version } = getAvroSchemaMetadata(this.schemaType!);
    // const subject = `${namespace}.${this.type}`;
    //
    // this.setHeaders(
    //   new MessageHeaders([
    //     [KafkaMessage.SCHEMA_NAMESPACE, namespace],
    //     [KafkaMessage.SCHEMA_VERSION, `${version}`],
    //     [KafkaMessage.SCHEMA_SUBJECT, subject],
    //     ...this.getHeaders(),
    //   ]),
    // );
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
