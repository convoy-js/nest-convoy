import { f } from '@deepkit/type';
import { Property } from '@mikro-orm/core';

import { Float, AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Namespace } from './channel';

@AvroSchema(Namespace.COMMON)
export class Money {
  @Property({ type: 'float' })
  @f.type(Float)
  amount: number;

  constructor(amount = 0.0) {
    this.amount = amount;
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    return new Money(this.amount - other.amount);
  }

  isGreaterThanOrEqual(other: Money): boolean {
    return this.amount >= other.amount;
  }
}
