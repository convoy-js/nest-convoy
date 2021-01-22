import { AvroSchema } from '@nest-convoy/messaging/broker/kafka';

import { Customer, CreditReservation } from '../entities';
import { Channel } from '../../common';

@AvroSchema(Channel.CUSTOMER)
export class CustomerCreditReserved {
  constructor(readonly creditReservations: readonly CreditReservation[]) {}
}

@AvroSchema(Channel.CUSTOMER)
export class CustomerNotFound {
  constructor(readonly id: Customer['id']) {}
}

@AvroSchema(Channel.CUSTOMER)
export class CustomerCreditLimitExceeded {}
