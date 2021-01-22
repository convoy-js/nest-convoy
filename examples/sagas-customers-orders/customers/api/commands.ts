import { t, f } from '@deepkit/type/dist/cjs';

import { AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Money, Namespace } from '../../common';

// TODO: Should be able to generate these from @deepkit/type framework
@AvroSchema(Namespace.CUSTOMER, 2)
export class ReserveCreditCommand {
  constructor(
    @f readonly customerId: number,
    @f readonly orderId: number,
    @t readonly orderTotal: Money,
  ) {}
}
