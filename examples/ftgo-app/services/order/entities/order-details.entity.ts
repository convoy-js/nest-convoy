import { Column, PrimaryColumn } from 'typeorm/index';

import { Money } from '@ftgo-app/libs/common';

export class OrderDetails {
  @PrimaryColumn()
  customerId: number;

  @PrimaryColumn()
  restaurantId: number;

  @Column(() => Money)
  orderTotal: Money;
}
