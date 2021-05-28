import { f } from '@deepkit/type';
import { Embeddable, Property } from '@mikro-orm/core';

import { Float, AvroSchema } from '@nest-convoy/kafka';

import { Namespace } from './channel';

@AvroSchema(Namespace.COMMON)
@Embeddable()
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
