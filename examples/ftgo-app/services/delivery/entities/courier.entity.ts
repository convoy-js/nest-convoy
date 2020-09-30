import { Column, PrimaryGeneratedColumn } from 'typeorm/index';

import { Delivery } from './delivery.entity';

export class Courier {
  assignedDeliveries: Delivery[];

  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    default: true,
  })
  available: boolean;
}
