import { f, t } from '@deepkit/type';
import { Property, Embedded } from '@mikro-orm/core';

import { AvroSchema } from '@nest-convoy/kafka';

import { Money, Namespace } from '../../common';

@AvroSchema(Namespace.ORDER)
export class OrderDetails {
  @Property()
  @f
  customerId: string;

  @Embedded(() => Money)
  @t
  orderTotal: Money;
}
