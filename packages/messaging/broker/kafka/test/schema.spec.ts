// SyntaxError: Unexpected token 'export'
import 'reflect-metadata';
import { f, t } from '@deepkit/type';
// import { parse }  from 'avsc';

import {
  Float,
  AVRO_SCHEMA_METADATA,
  AvroSchema,
  getAvroSchemaMetadata,
} from '../avro-schema';

enum Namespace {
  COMMON = 'common',
  CUSTOMER = 'customer',
}

describe('AvroSchema', () => {
  it('optional', () => {});

  describe('ComplexType', () => {
    it.only('union', () => {
      class ConfigA {
        @f
        val = '';
      }

      class ConfigB {
        @f.type(Float)
        val2 = 0;
      }

      @AvroSchema(Namespace.COMMON)
      class User {
        @f.union(ConfigA, ConfigB)
        config: ConfigA | ConfigB;
      }

      expect(getAvroSchemaMetadata(User).schema).toStrictEqual({
        name: User.name,
        namespace: Namespace.COMMON,
        type: 'record',
        fields: [
          {
            name: 'config',
            type: [
              {
                name: 'ConfigA',
                type: 'record',
                fields: [
                  {
                    name: 'val',
                    type: 'string',
                  },
                ],
              },
              {
                name: 'ConfigB',
                type: 'record',
                fields: [
                  {
                    name: 'val2',
                    type: 'float',
                  },
                ],
              },
            ],
          },
        ],
      });
    });

    it('array', () => {});

    // it('class', () => {});

    test('test', () => {
      @AvroSchema(Namespace.COMMON)
      class Money {
        @f.type(Float)
        amount: number;

        constructor(amount = 0.0) {
          this.amount = amount;
        }
      }

      @AvroSchema(Namespace.CUSTOMER, 2)
      class ReserveCreditCommand {
        constructor(
          @f readonly customerId: number,
          @f readonly orderId: number,
          @t readonly orderTotal: Money,
        ) {}
      }

      console.log(
        JSON.stringify(
          Reflect.getMetadata(AVRO_SCHEMA_METADATA, ReserveCreditCommand),
          null,
          2,
        ),
      );
    });
  });

  describe('PrimitiveType', () => {
    it('int', () => {});

    it('float', () => {});

    it('bytes', () => {});
  });
});
