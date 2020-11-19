import { Customer, CreditReservation } from '../entities';

export class CustomerCreditReserved {
  constructor(readonly creditReservations: readonly CreditReservation[]) {}
}

export class CustomerNotFound {
  constructor(readonly id: Customer['id']) {}
}

export class CustomerCreditLimitExceeded {}
