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
export const Enum = 'enum';

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
function getAvroType(
  schema: PropertySchema,
  namespace?: string,
): schema.AvroSchema {
  if (schema.type === 'class') {
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
        type: getAvroType(schema),
      })),
    } as schema.RecordType;
  }

  if (schema.type === 'enum') {
    return {
      type: Enum,
      name: schema.name,
    } as schema.EnumType;
  }

  return schema.type === 'number' ? Int : (schema.type as schema.PrimitiveType);
}

function createAvroSchema(type: Type, namespace: string): schema.RecordType {
  return getAvroType(
    {
      classType: type,
      type: 'class',
    } as any,
    namespace,
  ) as schema.RecordType;
}

export function AvroSchema(namespace: string, version = 1): ClassDecorator {
  return target => {
    internalSchemaRegistry.set(target.name, target);
    Reflect.defineMetadata(
      AVRO_SCHEMA_METADATA,
      {
        namespace,
        version,
        schema: createAvroSchema(target, namespace),
      } as AvroSchemaMetadata,
      target,
    );
  };
}
