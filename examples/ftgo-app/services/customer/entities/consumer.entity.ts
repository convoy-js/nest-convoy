import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm/index';

import { Identity, Money } from '@ftgo-app/libs/common';

@Entity()
export class Customer {
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
