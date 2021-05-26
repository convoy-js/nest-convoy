import { f } from '@deepkit/type';

import { AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Namespace } from '../../common';
import { Customer, CreditReservation } from '../entities';

@AvroSchema(Namespace.CUSTOMER)
export class CustomerCreditReserved {
  constructor(
    @f.array(CreditReservation)
    readonly creditReservations: readonly Omit<CreditReservation, 'customer'>[],
  ) {}
}

@AvroSchema(Namespace.CUSTOMER)
export class CustomerNotFound {
  constructor(@f readonly id: Customer['id']) {}
}

@AvroSchema(Namespace.CUSTOMER)
export class CustomerCreditLimitExceeded {}
