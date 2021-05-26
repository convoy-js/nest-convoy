import { f, t, uuid } from '@deepkit/type';
import { Property, Entity, PrimaryKey, Embedded, Enum } from '@mikro-orm/core';

import { AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Namespace } from '../../common';
import { OrderDetails, OrderState, RejectionReason } from '../common';

@Entity()
@AvroSchema(Namespace.ORDER)
export class Order {
  @PrimaryKey()
  @f
  id = uuid();

  @Embedded(() => OrderDetails)
  @t
  details: OrderDetails;

  @Enum(() => OrderState)
  @f.enum(OrderState)
  state: OrderState = OrderState.PENDING;

  @Enum({ items: () => RejectionReason, nullable: true })
  @f.enum(RejectionReason)
  rejectionReason?: RejectionReason;
}
