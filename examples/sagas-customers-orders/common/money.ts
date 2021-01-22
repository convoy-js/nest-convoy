import { Column } from 'typeorm';
import { f } from '@deepkit/type/dist/cjs';

import { Float, AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Namespace } from './channel';

@AvroSchema(Namespace.COMMON)
export class Money {
  @Column({ default: 0.0, type: Float })
  @f.type(Float)
  amount: number;

  constructor(amount = 0.0) {
    this.amount = amount;
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  subtract(other: Money) {
    return new Money(this.amount - other.amount);
  }

  isGreaterThanOrEqual(other: Money): boolean {
    return this.amount >= other.amount;
  }
}
