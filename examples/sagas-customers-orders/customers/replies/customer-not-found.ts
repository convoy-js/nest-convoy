import { Customer } from '../entities';

export class CustomerNotFound {
  constructor(readonly id: Customer['id']) {}
}
