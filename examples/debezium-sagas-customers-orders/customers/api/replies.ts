import { t, f } from '@deepkit/type';

import { AvroSchema } from '@nest-convoy/kafka';

import { Namespace } from '../../common';
import { CreditReservation } from '../entities';
import type { Customer } from '../entities';

@AvroSchema(Namespace.CUSTOMER)
export class CustomerCreditReserved {
  constructor(
    @f.array(CreditReservation)
    readonly creditReservations: readonly Omit<CreditReservation, 'customer'>[],
  ) {}
}

@AvroSchema(Namespace.CUSTOMER)
export class CustomerNotFound {
  constructor(@f.type(String) readonly id: Customer['id']) {}
}

@AvroSchema(Namespace.CUSTOMER)
export class CustomerCreditLimitExceeded {}
