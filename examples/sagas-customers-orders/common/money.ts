import { Column } from 'typeorm';

export class Money {
  static ZERO = new Money();

  @Column({ default: 0.0, type: 'float' })
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
