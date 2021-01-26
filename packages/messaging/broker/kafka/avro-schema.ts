import { Injectable, Type } from '@nestjs/common';
import { PropertySchema, getClassSchema, ClassSchema } from '@deepkit/type';
import type { schema } from 'avsc';
import { CircularDependencyException } from '@nestjs/core/errors/exceptions/circular-dependency.exception';
import { RuntimeException } from '@nestjs/core/errors/exceptions/runtime.exception';
import { COMPATIBILITY } from '@kafkajs/confluent-schema-registry';

import { AvroSchemaRegistry } from './avro-schema-registry';

export const AVRO_SCHEMA_METADATA = Symbol('AVRO_SCHEMA_METADATA');

export interface AvroSchemaMetadata {
  readonly namespace: string;
  readonly version: number;
  readonly compatibility?: COMPATIBILITY;
  readonly schema?: schema.RecordType;
}

export const Float = 'float';
export const Int = 'int';
export const Long = 'long';
export const Double = 'double';
export const Bytes = 'bytes';
// export const Enum = 'enum';

export function lazyLoadAvroSchema(
  target: string,
  { namespace }: AvroSchemaMetadata,
): schema.RecordType {
  const index = AvroSchemaRegistry.INTERNAL.findIndex(
    registry =>
      registry.target.name ===
      target /*&&
      registry.namespace === namespace &&
      registry.version === version,*/,
  );

  if (index < 0) {
    throw new RuntimeException('nothing found');
  }

  const reg = AvroSchemaRegistry.INTERNAL[index];
  if (!reg.schema) {
    AvroSchemaRegistry.INTERNAL[index] = {
      ...reg,
      schema: createAvroSchema(
        getClassSchema(reg.target),
        namespace,
      ) as schema.RecordType,
    };
  }

  return AvroSchemaRegistry.INTERNAL[index]!.schema!;
}

/*
target PrimitiveType = 'null' | 'boolean' | 'int' | 'long' | 'float' | 'double' | 'bytes' | 'string';
 */

/*
Default number is int
Float32Array = float
Integer = int
 */

export function createAvroSchema(
  schema: PropertySchema | ClassSchema,
  namespace?: string,
  reference?: ClassSchema,
): schema.AvroSchema | schema.AvroSchema[] {
  if (schema instanceof PropertySchema) {
    const value = ((): schema.AvroSchema | schema.AvroSchema[] => {
      switch (schema.type) {
        // TODO: Figure out how circular references work in AVRO
        case 'class':
          const classSchema = schema.getResolvedClassSchema();
          const meta = getAvroSchemaMetadata(classSchema.classType);
          return !meta
            ? createAvroSchema(classSchema, undefined, reference)
            : `${meta.namespace}.${classSchema.classType.name}`;

        case 'array':
          return {
            type: 'array',
            items: schema.templateArgs.flatMap(schema =>
              createAvroSchema(schema, undefined, reference),
            ),
          } as schema.ArrayType;

        // case 'map': {
        // }

        case 'union':
          // @ts-ignore
          return schema.templateArgs.flatMap(schema =>
            createAvroSchema(schema),
          );

        case 'enum':
          return {
            type: 'enum',
            // name: schema.name,
            symbols: Object.values(schema.getResolvedClassType()),
          } as schema.EnumType;

        default:
          return schema.type === 'number'
            ? Int
            : (schema.type as schema.PrimitiveType);
      }
    })();

    return schema.isOptional || schema.isNullable
      ? Array.isArray(value)
        ? ['null', ...value]
        : ['null', value]
      : value;
  } else {
    const props = schema.getClassProperties();
    const meta = Reflect.getMetadata(AVRO_SCHEMA_METADATA, schema.classType) as
      | AvroSchemaMetadata
      | undefined;

    return {
      name: schema.classType.name,
      namespace: namespace || meta?.namespace,
      type: 'record',
      fields: [...props.entries()].map(([name, propertySchema]) => {
        return {
          name,
          type: createAvroSchema(
            propertySchema,
            undefined,
            schema as ClassSchema,
          ),
        };
      }),
    } as schema.RecordType;
  }
}

export const isAvroSchema = (target: Type): boolean =>
  Reflect.hasMetadata(AVRO_SCHEMA_METADATA, target);

export const getAvroSchemaMetadata = (target: Type): AvroSchemaMetadata =>
  Reflect.getMetadata(AVRO_SCHEMA_METADATA, target);

export function AvroSchema(
  namespace: string,
  compatibility?: COMPATIBILITY,
  version = 1,
) {
  return (target: Type) => {
    // Injectable()(target);
    AvroSchemaRegistry.INTERNAL.push({
      target,
      namespace,
      compatibility,
      version,
    });

    // TODO: Remove when circular references are fixed
    // lazyLoadAvroSchema(target.name, namespace, version);

    Reflect.defineMetadata(
      AVRO_SCHEMA_METADATA,
      {
        namespace,
        version,
        compatibility,
      } as AvroSchemaMetadata,
      target,
    );
  };
}
