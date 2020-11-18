import { CreditReservation } from '../entities';

export class CustomerCreditReserved {
  constructor(readonly creditReservations: readonly CreditReservation[]) {}
}
