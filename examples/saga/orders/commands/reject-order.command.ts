import { Order } from '../entities';

export class RejectOrderCommand {
  constructor(readonly orderId: Order['id']) {}
}
