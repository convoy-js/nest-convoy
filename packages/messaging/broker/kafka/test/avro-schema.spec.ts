// SyntaxError: Unexpected token 'export'
import 'reflect-metadata';
import { f, getClassSchema, t } from '@deepkit/type';
// import { parse }  from 'avsc';

import {
  Float,
  AVRO_SCHEMA_METADATA,
  AvroSchema,
  getAvroSchemaMetadata,
  lazyLoadAvroSchema,
} from '../avro-schema';
import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Test } from '@nestjs/testing';

import { AvroSchemaRegistry } from '../avro-schema-registry';

enum Namespace {
  COMMON = 'common',
  CUSTOMER = 'customer',
}

describe('AvroSchemaRegistry', () => {
  let avroSchemaRegistry: AvroSchemaRegistry;

  @AvroSchema('b')
  class B {
    @f.array(t.type(() => A))
    a: A[];
  }

  @AvroSchema('a')
  class A {
    @t.type(() => B)
    b: B;
  }

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [DiscoveryModule],
      providers: [AvroSchemaRegistry, A, B],
    }).compile();

    avroSchemaRegistry = module.get(AvroSchemaRegistry);
  });

  it('test', async () => {
    await avroSchemaRegistry.onModuleInit();
  });
});

// describe('AvroSchema', () => {
//   it('optional', () => {});
//
//   describe('ComplexType', () => {
//     // TODO: Figure out how circular references work in AVRO
//     describe.only('circular reference', () => {
//       it('test', () => {
//         // TODO: Cannot create circular references to work
//         @AvroSchema('b')
//         class B {
//           @f
//           id: number;
//
//           @f.array(t.type(() => A))
//           a: A[];
//         }
//
//         @AvroSchema('a')
//         class A {
//           @t.type(() => B)
//           b: B;
//         }
//
//         // console.log(getClassSchema(B));
//
//         // This should remove A[] circular reference from B
//         console.log(JSON.stringify(lazyLoadAvroSchema(A.name, 'b'), null, 2));
//       });
//     });
//
//     it('union', () => {
//       class ConfigA {
//         @f
//         val = '';
//       }
//
//       class ConfigB {
//         @f.type(Float)
//         val2 = 0;
//       }
//
//       @AvroSchema(Namespace.COMMON)
//       class User {
//         @f.union(ConfigA, ConfigB)
//         config: ConfigA | ConfigB;
//       }
//
//       expect(getAvroSchemaMetadata(User).schema).toStrictEqual({
//         name: User.name,
//         namespace: Namespace.COMMON,
//         type: 'record',
//         fields: [
//           {
//             name: 'config',
//             type: [
//               {
//                 name: 'ConfigA',
//                 type: 'record',
//                 fields: [
//                   {
//                     name: 'val',
//                     type: 'string',
//                   },
//                 ],
//               },
//               {
//                 name: 'ConfigB',
//                 type: 'record',
//                 fields: [
//                   {
//                     name: 'val2',
//                     type: 'float',
//                   },
//                 ],
//               },
//             ],
//           },
//         ],
//       });
//     });
//
//     it('array', () => {});
//
//     // it('class', () => {});
//
//     test('test', () => {
//       @AvroSchema(Namespace.COMMON)
//       class Money {
//         @f.type(Float)
//         amount: number;
//
//         constructor(amount = 0.0) {
//           this.amount = amount;
//         }
//       }
//
//       @AvroSchema(Namespace.CUSTOMER)
//       class ReserveCreditCommand {
//         constructor(
//           @f readonly customerId: number,
//           @f readonly orderId: number,
//           @t readonly orderTotal: Money,
//         ) {}
//       }
//
//       console.log(
//         JSON.stringify(
//           Reflect.getMetadata(AVRO_SCHEMA_METADATA, ReserveCreditCommand),
//           null,
//           2,
//         ),
//       );
//     });
//   });
//
//   describe('PrimitiveType', () => {
//     it('int', () => {});
//
//     it('float', () => {});
//
//     it('bytes', () => {});
//   });
// });
