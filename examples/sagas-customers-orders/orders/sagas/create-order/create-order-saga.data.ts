import { Order } from '../../entities';

export class CreateOrderSagaData {
  id: Order['id'];
  rejectionReason?: Order['rejectionReason'];

  constructor(readonly details: Order['details']) {}
}
