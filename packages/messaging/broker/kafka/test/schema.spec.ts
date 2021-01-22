import { f, t } from '@deepkit/type';

import {
  Float,
  AVRO_SCHEMA_METADATA,
  AvroSchema,
} from '@nest-convoy/messaging/broker/kafka';
// SyntaxError: Unexpected token 'export'

describe('AvroSchema', () => {
  it('test', () => {
    enum Namespace {
      COMMON = 'common',
      CUSTOMER = 'customer',
    }

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
      Reflect.getMetadata(AVRO_SCHEMA_METADATA, ReserveCreditCommand),
    );
  });
});
