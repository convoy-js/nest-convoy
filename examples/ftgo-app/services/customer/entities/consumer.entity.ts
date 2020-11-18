import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Identity, Money } from '@ftgo-app/libs/common';

import { AggregateRoot } from '@nest-convoy/core';

@Entity()
export class Customer extends AggregateRoot<Customer> {
  @PrimaryGeneratedColumn()
  id: number;

  @Column(() => Identity)
  identity: Identity;

  @Column(() => Money)
  balance: Money;

  validateOrder(orderTotal: Money) /*: Money*/ {
    if (!this.balance.isGreaterThanOrEqual(orderTotal)) {
      throw '';
      // error
    }

    // return this.balance.subtract(orderTotal);
  }
}
