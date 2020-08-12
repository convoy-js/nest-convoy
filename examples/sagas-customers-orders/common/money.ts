import { Column } from 'typeorm';

export class Money {
  static ZERO = new Money(0);

  @Column({ default: 0, type: 'float' })
  amount: number;

  constructor(amount: number) {
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
