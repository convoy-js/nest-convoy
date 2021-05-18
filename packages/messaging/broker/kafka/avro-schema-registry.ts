import {
  Inject,
  Injectable,
  OnModuleInit,
  Optional,
  Type,
} from '@nestjs/common';
import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { getClassSchema } from '@deepkit/type';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

import { Message, MessageHeaders } from '@nest-convoy/messaging';

import { KAFKA_SCHEMA_REGISTRY } from './tokens';
import { KafkaMessage } from './kafka-message';
import {
  AVRO_SCHEMA_METADATA,
  AvroSchemaMetadata,
  createAvroSchema,
} from './avro-schema';

import type { EachMessagePayload } from 'kafkajs';
import type { schema } from 'avsc';

@Injectable()
export class AvroSchemaRegistry implements OnModuleInit {
  static readonly INTERNAL: Array<AvroSchemaMetadata & { target: Type }> = [];

  private records: Map<string, AvroSchemaMetadata>;

  constructor(
    private readonly discovery: DiscoveryService,
    @Optional()
    @Inject(KAFKA_SCHEMA_REGISTRY)
    private readonly registry: SchemaRegistry | undefined,
  ) {}

  private async createAvroSchemaRecords(): Promise<
    readonly [string, AvroSchemaMetadata][]
  > {
    const providers =
      await this.discovery.providersWithMetaAtKey<AvroSchemaMetadata>(
        AVRO_SCHEMA_METADATA,
      );

    return providers.map(({ meta, discoveredClass: { dependencyType } }) => [
      dependencyType.name,
      {
        ...meta,
        schema: createAvroSchema(
          getClassSchema(dependencyType),
          meta.namespace,
        ) as schema.RecordType,
      },
    ]);
  }

  async onModuleInit(): Promise<void> {
    if (this.registry) {
      this.records = new Map(
        AvroSchemaRegistry.INTERNAL.map(({ target, version, namespace }) => [
          target.name,
          {
            version,
            namespace,
            schema: createAvroSchema(
              getClassSchema(target),
              namespace,
            ) as schema.RecordType,
          },
        ]),
      );

      console.log(this.records);

      for (const [
        type,
        { schema, namespace, version, compatibility },
      ] of this.records.entries()) {
        const subject = `${namespace}.${type}`;
        console.log(subject, JSON.stringify(schema, null, 2));
        await this.registry.register(schema as any, {
          subject,
          compatibility,
        });
      }
    }
  }

  async encode(message: Message): Promise<Buffer> {
    const { schema, namespace, version, compatibility } = this.records.get(
      message.type,
    )!;
    const subject = `${namespace}.${message.type}`;

    message.setHeaders(
      new MessageHeaders([
        [KafkaMessage.SCHEMA_NAMESPACE, namespace],
        [KafkaMessage.SCHEMA_VERSION, version.toString()],
        [KafkaMessage.SCHEMA_SUBJECT, subject],
        ...message.getHeaders(),
      ]),
    );

    const { id: registryId } = await this.registry!.register(schema as any, {
      subject,
      compatibility,
    });

    // if (schema) {
    //   const { id } = await this.registry.register(schema as any, {
    //     subject,
    //   });
    //   registryId = id;
    // } else if (!schemaId) {
    //   registryId = version
    //     ? await this.registry.getRegistryId(subject, version)
    //     : await this.registry.getLatestSchemaId(subject);
    // } else {
    //   registryId = schemaId;
    // }

    message.setHeader(KafkaMessage.SCHEMA_ID, registryId);
    return this.registry!.encode(registryId, message.getPayload());
  }

  async decode(payload: EachMessagePayload): Promise<Buffer> {
    throw new Error('Not implemented!');
  }
}
