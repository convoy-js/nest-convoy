import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm/index';

import { Address } from '@ftgo-app/libs/common';

import { Courier } from './courier.entity';

export enum DeliveryState {
  CANCELLED = 'CANCELLED',
  SCHEDULED = 'SCHEDULED',
  PENDING = 'PENDING',
}

@Entity()
export class Delivery {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  restaurantId: number;

  @Column({
    nullable: true,
  })
  assignedCourier: Courier['id'] | null;

  @CreateDateColumn({
    type: 'timestamp',
  })
  pickUpTime: Date;

  @CreateDateColumn({
    type: 'timestamp',
  })
  deliveryTime: Date;

  @CreateDateColumn({
    type: 'timestamp',
  })
  readyBy: Date;

  @Column(() => Address)
  pickupAddress: Address;

  @Column({
    type: 'enum',
    enum: DeliveryState,
    default: DeliveryState.PENDING,
  })
  state: DeliveryState;

  schedule(readyBy: Date, assignedCourier: Courier['id']): void {
    this.readyBy = readyBy;
    this.assignedCourier = assignedCourier;
    this.state = DeliveryState.SCHEDULED;
  }

  cancel(): void {
    this.state = DeliveryState.CANCELLED;
    this.assignedCourier = null;
  }
}
