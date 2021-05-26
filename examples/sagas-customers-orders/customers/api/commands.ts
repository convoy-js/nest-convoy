import { t, f } from '@deepkit/type/dist/cjs';

import { AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Money, Namespace } from '../../common';

// TODO: Should be able to generate these from @deepkit/type framework
@AvroSchema(Namespace.CUSTOMER)
export class ReserveCreditCommand {
  constructor(
    @f readonly customerId: string,
    @f readonly orderId: string,
    @t readonly orderTotal: Money,
  ) {}
}
