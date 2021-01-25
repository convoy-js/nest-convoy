import { Type } from '@nestjs/common';
import { PropertySchema, getClassSchema } from '@deepkit/type';
import type { schema } from 'avsc';

import { ClassDecorator } from '@nest-convoy/common';

export const AVRO_SCHEMA_METADATA = Symbol('KAFKA_SCHEMA_METADATA');

export interface AvroSchemaMetadata {
  readonly schema: schema.RecordType;
  readonly namespace: string;
  readonly version: number;
}

export const Float = 'float';
export const Int = 'int';
export const Long = 'long';
export const Double = 'double';
export const Bytes = 'bytes';
// export const Enum = 'enum';

export const internalSchemaRegistry = new Map<string, Type>();

/*
type PrimitiveType = 'null' | 'boolean' | 'int' | 'long' | 'float' | 'double' | 'bytes' | 'string';
 */

/*
Default number is int
Float32Array = float
Integer = int
 */

// TODO: Finish @deepkit/type to avro schema conversion
function getAvroSchema(
  schema: PropertySchema,
  namespace?: string,
): schema.AvroSchema | schema.AvroSchema[] {
  const value = ((): schema.AvroSchema | schema.AvroSchema[] => {
    switch (schema.type) {
      case 'class':
        const classSchema = getClassSchema(schema.classType!);
        const props = classSchema.getClassProperties();
        const meta = Reflect.getMetadata(
          AVRO_SCHEMA_METADATA,
          schema.classType!,
        ) as AvroSchemaMetadata | undefined;

        return {
          name: schema.classType!.name,
          namespace: namespace || meta?.namespace,
          type: 'record',
          fields: [...props.entries()].map(([name, schema]) => ({
            name,
            type: getAvroSchema(schema),
          })),
        } as schema.RecordType;

      case 'array':
        return {
          type: 'array',
          items: schema.templateArgs.flatMap(schema => getAvroSchema(schema)),
        } as schema.ArrayType;

      // case 'map': {
      // }

      case 'union':
        // @ts-ignore
        return schema.templateArgs.flatMap(schema => getAvroSchema(schema));

      case 'enum':
        return {
          type: 'enum',
          // name: schema.name,
          symbols: Object.values(schema.classType!),
        } as schema.EnumType;

      default:
        return schema.type === 'number'
          ? Int
          : (schema.type as schema.PrimitiveType);
    }
  })();

  return schema.isOptional || schema.isNullable
    ? Array.isArray(value)
      ? [...value, 'null']
      : [value, 'null']
    : value;
}

export const getAvroSchemaMetadata = (target: Type): AvroSchemaMetadata =>
  Reflect.getMetadata(AVRO_SCHEMA_METADATA, target);

export function AvroSchema(namespace: string, version = 1): ClassDecorator {
  return target => {
    internalSchemaRegistry.set(target.name, target);
    const schema = getAvroSchema(
      {
        classType: target,
        type: 'class',
      } as any,
      namespace,
    ) as schema.RecordType;

    Reflect.defineMetadata(
      AVRO_SCHEMA_METADATA,
      {
        namespace,
        version,
        schema,
      } as AvroSchemaMetadata,
      target,
    );
  };
}
