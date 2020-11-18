import { Column, PrimaryGeneratedColumn } from 'typeorm';

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
