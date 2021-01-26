import { f } from '@deepkit/type';

import { AvroSchema, Int } from '@nest-convoy/messaging/broker/kafka';

import { Customer, CreditReservation } from '../entities';
import { Namespace } from '../../common';

@AvroSchema(Namespace.CUSTOMER)
export class CustomerCreditReserved {
  constructor(
    @f.array(CreditReservation)
    readonly creditReservations: readonly CreditReservation[],
  ) {}
}

@AvroSchema(Namespace.CUSTOMER)
export class CustomerNotFound {
  constructor(@f.type(Int) readonly id: Customer['id']) {}
}

@AvroSchema(Namespace.CUSTOMER)
export class CustomerCreditLimitExceeded {}
