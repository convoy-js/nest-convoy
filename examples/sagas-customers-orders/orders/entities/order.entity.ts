import { Column, Entity, PrimaryGeneratedColumn, VersionColumn } from 'typeorm';

import { OrderDetails, OrderState, RejectionReason } from '../common';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column(() => OrderDetails)
  details: OrderDetails;

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.PENDING,
  })
  state: OrderState;

  @Column({
    type: 'enum',
    enum: RejectionReason,
    nullable: true,
  })
  rejectionReason?: RejectionReason;

  @VersionColumn()
  version: string;
}
