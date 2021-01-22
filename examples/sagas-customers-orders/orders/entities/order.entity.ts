import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { f, t } from '@deepkit/type';

import { AvroSchema, Enum } from '@nest-convoy/messaging/broker/kafka';

import { OrderDetails, OrderState, RejectionReason } from '../common';
import { Namespace } from '../../common';

@Entity()
@AvroSchema(Namespace.ORDER)
export class Order {
  @PrimaryGeneratedColumn()
  @f
  id: number;

  @Column(() => OrderDetails)
  @t
  details: OrderDetails;

  @Column({
    type: 'enum',
    enum: OrderState,
    default: OrderState.PENDING,
  })
  @f.type(Enum)
  state: OrderState;

  @Column({
    type: 'enum',
    enum: RejectionReason,
    nullable: true,
  })
  @f.type(Enum)
  rejectionReason?: RejectionReason;
}
