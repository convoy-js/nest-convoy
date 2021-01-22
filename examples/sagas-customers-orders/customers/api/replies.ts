import { t, f } from '@deepkit/type';

import { AvroSchema, Int } from '@nest-convoy/messaging/broker/kafka';

import { Customer, CreditReservation } from '../entities';
import { Channel } from '../../common';

@AvroSchema(Channel.CUSTOMER)
export class CustomerCreditReserved {
  constructor(
    @t.array(CreditReservation)
    readonly creditReservations: readonly CreditReservation[],
  ) {}
}

@AvroSchema(Channel.CUSTOMER)
export class CustomerNotFound {
  constructor(@f.type(Int) readonly id: Customer['id']) {}
}

@AvroSchema(Channel.CUSTOMER)
export class CustomerCreditLimitExceeded {}
