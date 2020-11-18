import { Column, CreateDateColumn, Entity } from 'typeorm';

import { Delivery } from './delivery.entity';

export enum DeliveryActionType {
  PICKUP = 'PICKUP',
  DROP_OFF = 'DROP_OFF',
}

@Entity()
export class Action {
  @Column()
  delivery: Delivery;

  @CreateDateColumn({
    type: 'timestamp',
  })
  time: Date;
}
