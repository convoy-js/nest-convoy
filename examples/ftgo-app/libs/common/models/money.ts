import { Column } from 'typeorm/index';

export class Money {
  @Column({ default: 0.0, type: 'float' })
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

  multiply(amount: number): Money {
    return new Money(this.amount * amount);
  }
}
