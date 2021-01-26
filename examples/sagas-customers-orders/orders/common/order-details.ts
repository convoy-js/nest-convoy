import { Column } from 'typeorm';
import { f, t } from '@deepkit/type';
import { AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Money, Namespace } from '../../common';

@AvroSchema(Namespace.ORDER)
export class OrderDetails {
  @Column()
  @f
  customerId: number;

  @Column(() => Money)
  @t
  orderTotal: Money;
}
